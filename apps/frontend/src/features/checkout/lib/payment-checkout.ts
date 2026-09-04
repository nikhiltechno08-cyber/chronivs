/**
 * Provider-agnostic checkout opener.
 * UI never branches — checkout-store calls this instead of Razorpay directly.
 */

import type { RazorpaySuccessResponse } from '@/types/razorpay';

import { openRazorpayCheckout } from './razorpay';

const MOCK_DELAY_MS = 2000;

function randomToken(length = 10): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)]!;
  }
  return out;
}

export type PaymentCheckoutArgs = {
  provider: string;
  mockResult?: string | null;
  key: string;
  orderId: string;
  amount: number;
  currency: string;
  name?: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  onSuccess: (response: RazorpaySuccessResponse) => void;
  onDismiss: () => void;
};

/** Detect mock even if an older API omitted `provider`. Never open real Razorpay for mocks. */
export function isMockPaymentCheckout(args: {
  provider?: string | null;
  key?: string | null;
  orderId?: string | null;
}): boolean {
  const provider = (args.provider || '').trim().toLowerCase();
  if (provider === 'mock') return true;

  const key = (args.key || '').trim().toLowerCase();
  if (key === 'mock_key' || key === 'mock-key' || key.startsWith('mock')) return true;

  const orderId = (args.orderId || '').trim().toLowerCase();
  if (orderId.startsWith('order_mock_')) return true;

  return false;
}

async function openMockCheckout(args: PaymentCheckoutArgs): Promise<void> {
  const result = (args.mockResult || 'success').toLowerCase();

  await new Promise((resolve) => {
    window.setTimeout(resolve, MOCK_DELAY_MS);
  });

  if (result === 'cancelled') {
    args.onDismiss();
    return;
  }

  // success + failure both call verify — backend mock gateway decides outcome.
  const token = randomToken();
  args.onSuccess({
    razorpay_order_id: args.orderId,
    razorpay_payment_id: `pay_mock_${token}`,
    razorpay_signature: `mock_signature_${token}`,
  });
}

/**
 * Open the active provider checkout (mock simulator or Razorpay Checkout.js).
 */
export async function openPaymentCheckout(args: PaymentCheckoutArgs): Promise<void> {
  if (isMockPaymentCheckout({
    provider: args.provider,
    key: args.key,
    orderId: args.orderId,
  })) {
    return openMockCheckout(args);
  }

  return openRazorpayCheckout({
    key: args.key,
    orderId: args.orderId,
    amount: args.amount,
    currency: args.currency,
    name: args.name,
    description: args.description,
    prefill: args.prefill,
    notes: args.notes,
    onSuccess: args.onSuccess,
    onDismiss: args.onDismiss,
  });
}
