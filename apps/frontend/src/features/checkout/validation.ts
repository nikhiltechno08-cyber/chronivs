import type { CheckoutFormFields } from './types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INDIAN_MOBILE_RE = /^[6-9]\d{9}$/;

export type CheckoutValidationResult = {
  valid: boolean;
  errors: Partial<Record<keyof CheckoutFormFields, string>>;
};

export function normalizeIndianMobile(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) {
    return digits.slice(2);
  }
  return digits;
}

export function validateCheckoutForm(fields: CheckoutFormFields): CheckoutValidationResult {
  const errors: Partial<Record<keyof CheckoutFormFields, string>> = {};
  const name = fields.customerName.trim();

  if (!name) {
    errors.customerName = 'Name is required';
  } else if (name.length < 2) {
    errors.customerName = 'Name must be at least 2 characters';
  } else if (name.length > 60) {
    errors.customerName = 'Name must be at most 60 characters';
  }

  const email = fields.email.trim();
  if (!email) {
    errors.email = 'Email is required';
  } else if (!EMAIL_RE.test(email)) {
    errors.email = 'Enter a valid email address';
  }

  const mobile = normalizeIndianMobile(fields.mobile);
  if (!mobile) {
    errors.mobile = 'Mobile number is required';
  } else if (!INDIAN_MOBILE_RE.test(mobile)) {
    errors.mobile = 'Enter a valid 10-digit Indian mobile number';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
