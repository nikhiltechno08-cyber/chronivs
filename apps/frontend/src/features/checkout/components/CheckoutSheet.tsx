'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { memo, useCallback, useEffect, useId, useMemo, useState } from 'react';

import { useReducedMotion } from '@/animations/hooks/use-reduced-motion';
import { clearSessionMedia } from '@/features/studio/utils/session-media';

import { formatCheckoutPrice } from '../constants';
import { useCheckoutStore } from '../store/checkout-store';
import type { CheckoutFormFields } from '../types';

import '../checkout.css';

type CheckoutSheetProps = {
  onContinueEditing?: () => void;
  onPaymentReady?: (experienceUuid: string) => void;
  onToast?: (message: string) => void;
};

const ease = [0.22, 0.61, 0.36, 1] as const;

const TRUST_ITEMS = [
  'Lifetime Hosting',
  'Instant Delivery',
  'Email Link',
  'Mobile Friendly',
  'Secure Payment',
] as const;

export const CheckoutSheet = memo(function CheckoutSheet({
  onContinueEditing,
  onPaymentReady,
  onToast,
}: CheckoutSheetProps) {
  const titleId = useId();
  const prefersReducedMotion = useReducedMotion();
  const [paymentNote, setPaymentNote] = useState<string | null>(null);

  const isOpen = useCheckoutStore((s) => s.isOpen);
  const status = useCheckoutStore((s) => s.status);
  const customerName = useCheckoutStore((s) => s.customerName);
  const email = useCheckoutStore((s) => s.email);
  const mobile = useCheckoutStore((s) => s.mobile);
  const fieldErrors = useCheckoutStore((s) => s.fieldErrors);
  const shakingFields = useCheckoutStore((s) => s.shakingFields);
  const orderSummary = useCheckoutStore((s) => s.orderSummary);
  const errorMessage = useCheckoutStore((s) => s.errorMessage);
  const setField = useCheckoutStore((s) => s.setField);
  const closeCheckout = useCheckoutStore((s) => s.closeCheckout);
  const submitCheckout = useCheckoutStore((s) => s.submitCheckout);
  const startPayment = useCheckoutStore((s) => s.startPayment);

  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        left: `${6 + ((i * 17) % 88)}%`,
        top: `${8 + ((i * 29) % 80)}%`,
        delay: `${(i % 7) * 0.35}s`,
        size: `${2 + (i % 4)}px`,
      })),
    [],
  );

  useEffect(() => {
    if (!isOpen) return;
    setPaymentNote(null);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key === 'Escape' &&
        status !== 'submitting' &&
        status !== 'processing_payment'
      ) {
        closeCheckout();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeCheckout, isOpen, status]);

  const handleClose = useCallback(() => {
    if (status === 'submitting' || status === 'processing_payment') return;
    closeCheckout();
  }, [closeCheckout, status]);

  const handleContinueEditing = useCallback(() => {
    if (status === 'submitting' || status === 'processing_payment') return;
    closeCheckout();
    onContinueEditing?.();
  }, [closeCheckout, onContinueEditing, status]);

  const handleProceed = useCallback(async () => {
    setPaymentNote(null);

    // Retries reuse the session, but only when it belongs to the experience
    // currently being checked out — otherwise we'd publish the previous one.
    const current = useCheckoutStore.getState();
    const sessionMatchesExperience =
      current.checkoutSession != null &&
      (!current.experienceId ||
        current.checkoutSession.experienceUuid === current.experienceId);

    if (!sessionMatchesExperience) {
      const ok = await submitCheckout();
      if (!ok) return;
    }

    const paid = await startPayment();
    const session = useCheckoutStore.getState().checkoutSession;
    const nextStatus = useCheckoutStore.getState().status;

    if (paid && nextStatus === 'payment_success') {
      // Drop temporary studio session media after successful pay (draft DB row remains).
      clearSessionMedia();
      if (session?.experienceUuid) {
        onPaymentReady?.(session.experienceUuid);
      }
      setPaymentNote('Payment successful. Your experience is ready to publish.');
      onToast?.('Payment successful');
      return;
    }

    if (nextStatus === 'payment_cancelled') {
      setPaymentNote('Payment cancelled. You can try again when ready.');
    }
  }, [onPaymentReady, onToast, startPayment, submitCheckout]);

  const fieldClass = (key: keyof CheckoutFormFields, extra = '') =>
    [
      'checkout-field',
      fieldErrors[key] ? 'checkout-field--invalid' : '',
      shakingFields[key] ? 'checkout-field--shake' : '',
      extra,
    ]
      .filter(Boolean)
      .join(' ');

  const rootVariants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
      };

  const sheetVariants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        hidden: { opacity: 0, y: 36, scale: 0.96 },
        visible: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 20, scale: 0.98 },
      };

  const stagger = prefersReducedMotion
    ? undefined
    : {
        hidden: {},
        visible: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } },
      };

  const item = prefersReducedMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease } },
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="checkout-root"
          className="checkout-root"
          role="presentation"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={rootVariants}
          transition={{ duration: 0.32, ease }}
        >
          <button
            type="button"
            className="checkout-backdrop"
            aria-label="Close checkout"
            onClick={handleClose}
          />

          <div className="checkout-atmosphere" aria-hidden="true">
            <div className="checkout-vignette" />
            <div className="checkout-aurora" />
            <div className="checkout-radial" />
            <div className="checkout-grain" />
            {!prefersReducedMotion &&
              particles.map((p, i) => (
                <span
                  key={i}
                  className="checkout-particle"
                  style={{
                    left: p.left,
                    top: p.top,
                    width: p.size,
                    height: p.size,
                    animationDelay: p.delay,
                  }}
                />
              ))}
          </div>

          <motion.div
            className="checkout-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={sheetVariants}
            transition={{ duration: 0.45, ease }}
            style={{ overflow: 'hidden' }}
          >
            <div className="checkout-handle" aria-hidden="true" />

            <form
              className="checkout-shell"
              onSubmit={(e) => {
                e.preventDefault();
                void handleProceed();
              }}
              noValidate
            >
              <div
                className="checkout-scroll"
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
              >
                <header className="checkout-header">
                  <p className="checkout-eyebrow">Secure Checkout</p>
                  <h2 id={titleId} className="checkout-title">
                    Create Your Experience
                  </h2>
                  <p className="checkout-subtitle">
                    Complete your purchase to publish your personalized experience.
                  </p>
                </header>

                <motion.div className="checkout-body" variants={stagger} initial="hidden" animate="visible">
                  {orderSummary && (
                    <motion.section
                      className="checkout-summary"
                      aria-label="Order summary"
                      variants={item}
                    >
                      <div className="checkout-summary-main">
                        <div className="checkout-thumb" aria-hidden="true">
                          <span>✦</span>
                        </div>
                        <div className="checkout-summary-copy">
                          <p className="checkout-summary-label">Selected template</p>
                          <h3 className="checkout-summary-name">{orderSummary.templateName}</h3>
                          <div className="checkout-summary-tags">
                            <span>{orderSummary.occasion}</span>
                            <span>{orderSummary.relationship}</span>
                          </div>
                        </div>
                      </div>
                      <div className="checkout-summary-pricing">
                        <div className="checkout-summary-row">
                          <span>Price</span>
                          <strong>{formatCheckoutPrice(orderSummary.price)}</strong>
                        </div>
                        {orderSummary.discount > 0 && (
                          <div className="checkout-summary-row checkout-summary-row--discount">
                            <span>Discount</span>
                            <strong>−{formatCheckoutPrice(orderSummary.discount)}</strong>
                          </div>
                        )}
                        <div className="checkout-summary-total">
                          <span>Total</span>
                          <strong>{formatCheckoutPrice(orderSummary.total)}</strong>
                        </div>
                      </div>
                    </motion.section>
                  )}

                  <div className="checkout-form">
                    <motion.label className={fieldClass('customerName')} variants={item}>
                      <span>Customer Name</span>
                      <div className="checkout-input-wrap">
                        <i className="checkout-input-icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none">
                            <path
                              d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Zm0 2.25c-3.6 0-6.75 1.8-6.75 4.05V20h13.5v-1.7c0-2.25-3.15-4.05-6.75-4.05Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                          </svg>
                        </i>
                        <input
                          type="text"
                          name="customerName"
                          autoComplete="name"
                          maxLength={60}
                          value={customerName}
                          onChange={(e) => setField('customerName', e.target.value)}
                          placeholder="Your name"
                          aria-invalid={Boolean(fieldErrors.customerName)}
                        />
                      </div>
                      {fieldErrors.customerName && (
                        <em className="checkout-error">{fieldErrors.customerName}</em>
                      )}
                    </motion.label>

                    <motion.label className={fieldClass('email')} variants={item}>
                      <span>Email Address</span>
                      <div className="checkout-input-wrap">
                        <i className="checkout-input-icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none">
                            <path
                              d="M4 6.75h16A1.25 1.25 0 0 1 21.25 8v8A1.25 1.25 0 0 1 20 17.25H4A1.25 1.25 0 0 1 2.75 16V8A1.25 1.25 0 0 1 4 6.75Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                            <path
                              d="m3.5 8 8.5 6 8.5-6"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        </i>
                        <input
                          type="email"
                          name="email"
                          autoComplete="email"
                          inputMode="email"
                          value={email}
                          onChange={(e) => setField('email', e.target.value)}
                          placeholder="you@email.com"
                          aria-invalid={Boolean(fieldErrors.email)}
                        />
                      </div>
                      {fieldErrors.email && <em className="checkout-error">{fieldErrors.email}</em>}
                    </motion.label>

                    <motion.label className={fieldClass('mobile')} variants={item}>
                      <span>Mobile Number</span>
                      <div className="checkout-input-wrap">
                        <i className="checkout-input-icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none">
                            <rect
                              x="7"
                              y="2.75"
                              width="10"
                              height="18.5"
                              rx="2.2"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                            <path
                              d="M11 17.5h2"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        </i>
                        <input
                          type="tel"
                          name="mobile"
                          autoComplete="tel"
                          inputMode="numeric"
                          maxLength={15}
                          value={mobile}
                          onChange={(e) => setField('mobile', e.target.value)}
                          placeholder="10-digit mobile"
                          aria-invalid={Boolean(fieldErrors.mobile)}
                        />
                      </div>
                      {fieldErrors.mobile && <em className="checkout-error">{fieldErrors.mobile}</em>}
                    </motion.label>

                    {errorMessage && <p className="checkout-banner-error">{errorMessage}</p>}
                    {paymentNote && <p className="checkout-banner-ok">{paymentNote}</p>}
                  </div>
                </motion.div>
              </div>

              <div className="checkout-sticky">
                <button
                  type="submit"
                  className="checkout-btn-primary"
                  disabled={
                    status === 'submitting' ||
                    status === 'processing_payment' ||
                    status === 'payment_success'
                  }
                >
                  {status === 'submitting'
                    ? 'Loading…'
                    : status === 'processing_payment'
                      ? 'Processing Payment…'
                      : status === 'payment_success'
                        ? 'Payment Success'
                        : status === 'payment_failed'
                          ? 'Retry Secure Payment'
                          : status === 'payment_cancelled'
                            ? 'Retry Secure Payment'
                            : 'Continue to Secure Payment'}
                </button>
                <button
                  type="button"
                  className="checkout-btn-secondary"
                  onClick={handleContinueEditing}
                  disabled={status === 'submitting' || status === 'processing_payment'}
                >
                  Continue Editing
                </button>
                <ul className="checkout-trust">
                  {TRUST_ITEMS.map((itemLabel) => (
                    <li key={itemLabel}>✓ {itemLabel}</li>
                  ))}
                </ul>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
