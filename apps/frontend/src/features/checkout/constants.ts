/** Configurable checkout pricing — do not hardcode amounts in components. */

export const CHECKOUT_CURRENCY = 'INR' as const;

/** Base price in INR paise-free whole rupees */
export const CHECKOUT_BASE_PRICE = 199;

export const CHECKOUT_CURRENCY_SYMBOL = '₹';

export function formatCheckoutPrice(amount: number = CHECKOUT_BASE_PRICE): string {
  return `${CHECKOUT_CURRENCY_SYMBOL}${amount}`;
}
