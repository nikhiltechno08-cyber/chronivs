'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';

import { CHECKOUT_BASE_PRICE, CHECKOUT_CURRENCY } from '../constants';
import { useCheckoutStore } from '../store/checkout-store';
import type { CheckoutOrderSummary } from '../types';

type OpenCheckoutArgs = {
  templateId: string;
  templateName: string;
  occasion: string;
  relationship: string;
  experienceId: string | null;
  price?: number;
};

type CheckoutContextValue = {
  isOpen: boolean;
  openCheckout: (args: OpenCheckoutArgs) => void;
  closeCheckout: () => void;
  experienceId: string | null;
};

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const isOpen = useCheckoutStore((s) => s.isOpen);
  const experienceId = useCheckoutStore((s) => s.experienceId);
  const open = useCheckoutStore((s) => s.openCheckout);
  const close = useCheckoutStore((s) => s.closeCheckout);

  const openCheckout = useCallback(
    (args: OpenCheckoutArgs) => {
      const price = args.price ?? CHECKOUT_BASE_PRICE;
      const summary: CheckoutOrderSummary = {
        templateId: args.templateId,
        templateName: args.templateName,
        occasion: args.occasion,
        relationship: args.relationship,
        price,
        discount: 0,
        total: price,
        currency: CHECKOUT_CURRENCY,
      };
      open(summary, args.experienceId);
    },
    [open],
  );

  const value = useMemo(
    () => ({
      isOpen,
      openCheckout,
      closeCheckout: close,
      experienceId,
    }),
    [close, experienceId, isOpen, openCheckout],
  );

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

export function useCheckout(): CheckoutContextValue {
  const ctx = useContext(CheckoutContext);
  if (!ctx) {
    throw new Error('useCheckout must be used within CheckoutProvider');
  }
  return ctx;
}

/** Safe when CheckoutProvider may be absent (e.g. published experiences). */
export function useOptionalCheckout(): CheckoutContextValue | null {
  return useContext(CheckoutContext);
}
