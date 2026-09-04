import { api } from '@/services/api-client';

import type { CreateCheckoutPayload, CreateCheckoutResponse } from '../types';

import { createPaymentOrder } from './payment-service';

/**
 * Checkout API client — session create + Razorpay order prep.
 */
export async function createCheckoutSession(
  payload: CreateCheckoutPayload,
): Promise<CreateCheckoutResponse> {
  return api.post<CreateCheckoutResponse>('/checkout/create', payload);
}

/** Create a Razorpay order for the experience after checkout session is ready. */
export async function preparePayment(experienceId: string) {
  const order = await createPaymentOrder(experienceId);
  return { ready: true as const, order };
}
