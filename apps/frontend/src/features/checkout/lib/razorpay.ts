/**
 * Official Razorpay Checkout.js loader (CDN).
 * Does not use the server secret — only the public key from create-order.
 */

import type { RazorpayConstructor, RazorpayOptions, RazorpaySuccessResponse } from '@/types/razorpay';

const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

let loading: Promise<RazorpayConstructor> | null = null;

export function loadRazorpay(): Promise<RazorpayConstructor> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay can only run in the browser'));
  }
  if (window.Razorpay) {
    return Promise.resolve(window.Razorpay);
  }
  if (loading) return loading;

  loading = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => {
        if (window.Razorpay) resolve(window.Razorpay);
        else reject(new Error('Razorpay failed to load'));
      });
      existing.addEventListener('error', () => reject(new Error('Razorpay script failed')));
      return;
    }

    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      if (window.Razorpay) resolve(window.Razorpay);
      else reject(new Error('Razorpay failed to initialize'));
    };
    script.onerror = () => {
      loading = null;
      reject(new Error('Could not load Razorpay Checkout'));
    };
    document.body.appendChild(script);
  });

  return loading;
}

export type OpenRazorpayCheckoutArgs = {
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

function isMockKey(key: string): boolean {
  const normalized = key.trim().toLowerCase();
  return (
    normalized === 'mock_key' ||
    normalized === 'mock-key' ||
    normalized.startsWith('mock')
  );
}

export async function openRazorpayCheckout(args: OpenRazorpayCheckoutArgs): Promise<void> {
  // Never load Checkout.js for mock credentials (defense in depth).
  if (isMockKey(args.key) || args.orderId.startsWith('order_mock_')) {
    throw new Error(
      'Mock payment key received by Razorpay opener. Use mock checkout instead.',
    );
  }

  const Razorpay = await loadRazorpay();

  const options: RazorpayOptions = {
    key: args.key,
    amount: args.amount,
    currency: args.currency,
    name: args.name ?? 'Chronivs',
    description: args.description ?? 'Chronivs Experience',
    order_id: args.orderId,
    prefill: args.prefill,
    notes: args.notes,
    theme: { color: '#c9a227' },
    handler: args.onSuccess,
    modal: {
      ondismiss: args.onDismiss,
    },
  };

  const instance = new Razorpay(options);
  instance.open();
}
