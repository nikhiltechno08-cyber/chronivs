/**
 * Payment API client — Razorpay order create / verify / failure.
 * Secret key never leaves the backend.
 */

import { api } from '@/services/api-client';

export type CreateOrderResponse = {
  order_id: string;
  amount: number;
  currency: string;
  razorpay_key: string;
  experience_id: string;
  payment_status: string;
  /** Active backend provider: mock | razorpay */
  provider?: string;
  /** Mock-only: success | failure | cancelled */
  mock_result?: string | null;
};

export type VerifyPaymentResponse = {
  success: boolean;
  payment_status: string;
  experience_status: string;
  experience_id: string;
  order_id: string;
  payment_id: string;
  amount: number | string;
  currency: string;
  verified_at?: string | null;
  message: string;
};

export type PaymentFailureResponse = {
  success: boolean;
  payment_status: string;
  experience_id: string;
  message: string;
};

export async function createPaymentOrder(experienceId: string): Promise<CreateOrderResponse> {
  return api.post<CreateOrderResponse>('/payments/create-order', {
    experienceId,
  });
}

export async function verifyPayment(payload: {
  order_id: string;
  payment_id: string;
  signature: string;
  experience_id: string;
  payment_method?: string | null;
}): Promise<VerifyPaymentResponse> {
  return api.post<VerifyPaymentResponse>('/payments/verify', payload);
}

export async function recordPaymentFailure(payload: {
  experience_id: string;
  order_id?: string | null;
  reason?: string | null;
  cancelled?: boolean;
  gateway_response?: Record<string, unknown> | null;
}): Promise<PaymentFailureResponse> {
  return api.post<PaymentFailureResponse>('/payments/failure', payload);
}
