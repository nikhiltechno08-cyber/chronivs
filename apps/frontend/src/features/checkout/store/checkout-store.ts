'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  buildExperienceDataFromStudio,
  toBackendExperienceData,
} from '@/features/experience-engine/adapters/experience-data-adapter';
import { resolveTemplateId } from '@/features/experience-engine/core/template-registry';
import { updateExperience } from '@/services/experience.service';
import { runPublishValidationPipeline } from '@/services/publishValidator';
import { useStudioStore } from '@/features/studio/store/studio-store';
import { touchExperience } from '@/lib/createExperience';
import { ApiError } from '@/services/api-client';
import { getExperience } from '@/services/experience.service';

import { CHECKOUT_BASE_PRICE, CHECKOUT_CURRENCY } from '../constants';
import { isMockPaymentCheckout, openPaymentCheckout } from '../lib/payment-checkout';
import { createCheckoutSession } from '../services/checkout-service';
import {
  createPaymentOrder,
  recordPaymentFailure,
  verifyPayment,
} from '../services/payment-service';

import type {
  CheckoutFormFields,
  CheckoutOrderSummary,
  CheckoutSession,
  CheckoutState,
} from '../types';
import { normalizeIndianMobile, validateCheckoutForm } from '../validation';

type CheckoutActions = {
  openCheckout: (summary: CheckoutOrderSummary, experienceId: string | null) => void;
  closeCheckout: () => void;
  setField: <K extends keyof CheckoutFormFields>(key: K, value: CheckoutFormFields[K]) => void;
  clearFieldError: (key: keyof CheckoutFormFields) => void;
  triggerShake: (keys: (keyof CheckoutFormFields)[]) => void;
  submitCheckout: () => Promise<boolean>;
  /** Create Razorpay order + open Checkout.js + verify on success. */
  startPayment: () => Promise<boolean>;
  /** Drop the paid/stale session but keep customer contact details. */
  clearCheckoutSession: () => void;
  resetCheckout: () => void;
};

export type CheckoutStore = CheckoutState & CheckoutActions;

const emptyFields: CheckoutFormFields = {
  customerName: '',
  email: '',
  mobile: '',
  couponCode: '',
};

const PAYMENT_ALREADY_COMPLETE_CODES = new Set([
  'already_published',
  'already_ready_to_publish',
  'payment_already_success',
]);

function isPaymentAlreadyComplete(err: unknown): boolean {
  return err instanceof ApiError && PAYMENT_ALREADY_COMPLETE_CODES.has(err.code ?? '');
}

const initialState: CheckoutState = {
  ...emptyFields,
  isOpen: false,
  status: 'idle',
  errorMessage: null,
  fieldErrors: {},
  shakingFields: {},
  orderSummary: null,
  experienceId: null,
  checkoutSession: null,
};

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      openCheckout: (summary, experienceId) => {
        // The session is persisted so a failed payment can be retried. It must
        // never survive into a different experience — reusing it would pay for
        // (and publish) the previous draft and hand back its old public link.
        const previous = get().checkoutSession;
        const reusable = Boolean(
          previous && experienceId && previous.experienceUuid === experienceId,
        );

        set({
          isOpen: true,
          status: reusable ? 'ready_for_payment' : 'editing',
          errorMessage: null,
          fieldErrors: {},
          shakingFields: {},
          checkoutSession: reusable ? previous : null,
          orderSummary: {
            ...summary,
            price: summary.price || CHECKOUT_BASE_PRICE,
            discount: summary.discount || 0,
            total: summary.total || summary.price || CHECKOUT_BASE_PRICE,
            currency: summary.currency || CHECKOUT_CURRENCY,
          },
          experienceId,
        });
      },

      closeCheckout: () => {
        const status = get().status;
        if (status === 'processing_payment') return;
        const next =
          status === 'payment_success'
            ? 'payment_success'
            : get().checkoutSession
              ? 'ready_for_payment'
              : 'idle';
        set({ isOpen: false, status: next });
      },

      setField: (key, value) =>
        set((state) => ({
          [key]: value,
          fieldErrors: { ...state.fieldErrors, [key]: undefined },
        })),

      clearFieldError: (key) =>
        set((state) => ({
          fieldErrors: { ...state.fieldErrors, [key]: undefined },
        })),

      triggerShake: (keys) => {
        const shaking: CheckoutState['shakingFields'] = {};
        keys.forEach((k) => {
          shaking[k] = true;
        });
        set({ shakingFields: shaking });
        window.setTimeout(() => set({ shakingFields: {} }), 520);
      },

      submitCheckout: async () => {
        const state = get();
        const fields: CheckoutFormFields = {
          customerName: state.customerName,
          email: state.email,
          mobile: state.mobile,
          couponCode: state.couponCode,
        };
        const result = validateCheckoutForm(fields);
        if (!result.valid) {
          set({ fieldErrors: result.errors, status: 'editing' });
          get().triggerShake(Object.keys(result.errors) as (keyof CheckoutFormFields)[]);
          return false;
        }

        set({ status: 'submitting', errorMessage: null });
        try {
          const summary = state.orderSummary;
          const studio = useStudioStore.getState();
          const templateId =
            summary?.templateId ??
            studio.generatedExperience?.templateId ??
            studio.templateConfig.templateId ??
            resolveTemplateId(studio.occasion, studio.relationship) ??
            '';

          // state.experienceId comes from the just-validated draft, so it wins
          // over the studio store, which can still hold a previous session id.
          let experienceData = buildExperienceDataFromStudio({
            experienceId: state.experienceId ?? studio.generatedExperience?.id ?? '',
            occasion: studio.occasion,
            relationship: studio.relationship,
            templateId,
            senderName: studio.senderName,
            receiverName: studio.receiverName,
            specialDate: studio.specialDate,
            customMessage: studio.customMessage,
            photos: studio.photos,
            audio: studio.audio,
          });

          experienceData = touchExperience(experienceData, {
            creator: {
              ...experienceData.creator,
              name: fields.customerName.trim() || experienceData.creator.name,
              email: fields.email.trim(),
              phone: normalizeIndianMobile(fields.mobile),
            },
          });

          // Full pre-payment validation (contact required). Blocks payment path if invalid.
          const publishValidation = await runPublishValidationPipeline({
            stage: 'pre_payment',
            experienceId: state.experienceId || experienceData.experienceId || null,
            giftMessage: undefined,
            creator: {
              name: fields.customerName.trim(),
              email: fields.email.trim(),
              phone: normalizeIndianMobile(fields.mobile),
            },
          });
          if (!publishValidation.valid) {
            const message =
              publishValidation.errors[0]?.message ?? 'Experience is incomplete';
            set({ status: 'error', errorMessage: message });
            return false;
          }

          const experienceUuid = publishValidation.experienceId || state.experienceId || '';
          experienceData = touchExperience(experienceData, {
            experienceId: experienceUuid,
            creator: {
              ...experienceData.creator,
              name: fields.customerName.trim(),
              email: fields.email.trim(),
              phone: normalizeIndianMobile(fields.mobile),
            },
          });

          // Keep customer contact on the draft for payment readiness.
          if (experienceUuid) {
            await updateExperience(experienceUuid, experienceData);
          }

          const backendExperienceData = toBackendExperienceData(experienceData);

          const response = await createCheckoutSession({
            customer_name: fields.customerName.trim(),
            email: fields.email.trim(),
            mobile: normalizeIndianMobile(fields.mobile),
            coupon_code: fields.couponCode.trim() || null,
            template_name: summary?.templateName ?? null,
            template_slug: summary?.templateId ?? templateId ?? null,
            occasion: summary?.occasion ?? studio.occasion ?? null,
            relationship: summary?.relationship ?? studio.relationship ?? null,
            experience_data: backendExperienceData,
            experience_uuid: experienceUuid,
          });

          const session: CheckoutSession = {
            checkoutUuid: response.checkout_uuid,
            experienceUuid: String(response.experience_uuid || experienceUuid),
            amount: Number(response.amount),
            discountAmount: Number(response.discount_amount),
            total: Number(response.total),
            currency: response.currency,
            status: response.status,
          };

          const durableId = String(response.experience_uuid || experienceUuid);

          set({
            status: 'ready_for_payment',
            checkoutSession: session,
            experienceId: durableId,
            orderSummary: summary
              ? {
                  ...summary,
                  price: Number(response.amount),
                  discount: Number(response.discount_amount),
                  total: Number(response.total),
                  currency: response.currency,
                }
              : summary,
          });

          // Keep studio draft experience id aligned with durable backend UUID (no UI change).
          const current = useStudioStore.getState().generatedExperience;
          if (current) {
            useStudioStore.getState().setGeneratedExperience({
              ...current,
              id: durableId,
              status: 'ready',
            });
          } else {
            useStudioStore.getState().setGeneratedExperience({
              id: durableId,
              status: 'ready',
              templateId: summary?.templateId,
              previewTitle: summary?.templateName,
            });
          }

          return true;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Could not create checkout session';
          set({ status: 'error', errorMessage: message });
          return false;
        }
      },

      startPayment: async () => {
        const state = get();
        const experienceId =
          state.experienceId || state.checkoutSession?.experienceUuid || '';
        if (!experienceId) {
          set({
            status: 'payment_failed',
            errorMessage: 'Missing experience id. Please try checkout again.',
          });
          return false;
        }

        // Never pay against a session that belongs to another experience.
        if (state.checkoutSession && state.checkoutSession.experienceUuid !== experienceId) {
          set({
            checkoutSession: null,
            status: 'editing',
            errorMessage: 'Checkout was reset for your current experience. Please continue again.',
          });
          return false;
        }

        const alreadyPaid = state.status === 'payment_success';

        set({ status: 'processing_payment', errorMessage: null });

        try {
          if (alreadyPaid) {
            set({ status: 'payment_success', errorMessage: null });
            return true;
          }

          try {
            const exp = await getExperience(experienceId);
            if (exp.status === 'published' || exp.status === 'ready_to_publish') {
              set({ status: 'payment_success', errorMessage: null });
              return true;
            }
          } catch {
            // Continue to payment order creation.
          }

          const order = await createPaymentOrder(experienceId);
          const provider = isMockPaymentCheckout({
            provider: order.provider,
            key: order.razorpay_key,
            orderId: order.order_id,
          })
            ? 'mock'
            : order.provider || 'razorpay';

          await new Promise<boolean>((resolve) => {
            void openPaymentCheckout({
              provider,
              mockResult: order.mock_result ?? 'success',
              key: order.razorpay_key,
              orderId: order.order_id,
              amount: order.amount,
              currency: order.currency,
              name: 'Chronivs',
              description: state.orderSummary?.templateName || 'Chronivs Experience',
              prefill: {
                name: state.customerName,
                email: state.email,
                contact: state.mobile,
              },
              notes: {
                experience_id: experienceId,
              },
              onSuccess: (response) => {
                void (async () => {
                  try {
                    set({ status: 'processing_payment', errorMessage: null });
                    await verifyPayment({
                      order_id: response.razorpay_order_id,
                      payment_id: response.razorpay_payment_id,
                      signature: response.razorpay_signature,
                      experience_id: experienceId,
                    });
                    set({
                      status: 'payment_success',
                      errorMessage: null,
                    });
                    resolve(true);
                  } catch (err) {
                    const message =
                      err instanceof Error
                        ? err.message
                        : 'Payment verification failed';
                    set({ status: 'payment_failed', errorMessage: message });
                    resolve(false);
                  }
                })();
              },
              onDismiss: () => {
                void (async () => {
                  try {
                    await recordPaymentFailure({
                      experience_id: experienceId,
                      order_id: order.order_id,
                      cancelled: true,
                      reason: 'Payment cancelled by user',
                    });
                  } catch {
                    // Still surface cancelled state even if logging fails.
                  }
                  set({
                    status: 'payment_cancelled',
                    errorMessage: 'Payment was cancelled. You can try again anytime.',
                  });
                  resolve(false);
                })();
              },
            }).catch((err: unknown) => {
              const message =
                err instanceof Error ? err.message : 'Could not open payment checkout';
              set({ status: 'payment_failed', errorMessage: message });
              resolve(false);
            });
          });

          return get().status === 'payment_success';
        } catch (err) {
          if (isPaymentAlreadyComplete(err)) {
            set({
              status: 'payment_success',
              errorMessage: null,
            });
            return true;
          }

          const message = err instanceof Error ? err.message : 'Could not start payment';
          try {
            await recordPaymentFailure({
              experience_id: experienceId,
              reason: message,
              cancelled: false,
            });
          } catch {
            // ignore secondary failure
          }
          set({ status: 'payment_failed', errorMessage: message });
          return false;
        }
      },

      clearCheckoutSession: () =>
        set({
          isOpen: false,
          status: 'idle',
          errorMessage: null,
          fieldErrors: {},
          shakingFields: {},
          orderSummary: null,
          experienceId: null,
          checkoutSession: null,
        }),

      resetCheckout: () => set({ ...initialState }),
    }),
    {
      name: 'chronivs-checkout',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        customerName: state.customerName,
        email: state.email,
        mobile: state.mobile,
        couponCode: state.couponCode,
        orderSummary: state.orderSummary,
        experienceId: state.experienceId,
        checkoutSession: state.checkoutSession,
        // Keep form data until payment; do not persist open UI state
      }),
    },
  ),
);
