import type { AdminSearchIntent } from './types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PAYMENT_ID_PATTERN = /^(pay_|pi_|rzp_|payment_)/i;
const ORDER_ID_PATTERN = /^(ord_|order_)/i;

export function detectSearchIntent(query: string): AdminSearchIntent {
  const trimmed = query.trim();
  if (!trimmed) {
    return 'general';
  }

  if (EMAIL_PATTERN.test(trimmed)) {
    return 'email';
  }

  if (UUID_PATTERN.test(trimmed)) {
    return 'experience_id';
  }

  if (PAYMENT_ID_PATTERN.test(trimmed)) {
    return 'payment_id';
  }

  if (ORDER_ID_PATTERN.test(trimmed)) {
    return 'order_id';
  }

  const lower = trimmed.toLowerCase();
  if (lower.includes('birthday') || lower.includes('anniversary') || lower.includes('occasion')) {
    return 'occasion';
  }

  if (lower.includes('template') || lower.includes('storybook') || lower.includes('timeline')) {
    return 'template';
  }

  if (trimmed.includes('@')) {
    return 'email';
  }

  if (trimmed.split(/\s+/).length >= 2) {
    return 'name';
  }

  return 'general';
}

export function getSearchIntentHint(intent: AdminSearchIntent): string | null {
  switch (intent) {
    case 'order_id':
      return 'Searching orders';
    case 'payment_id':
      return 'Searching payments';
    case 'experience_id':
      return 'Searching experiences';
    case 'email':
      return 'Searching customers and orders';
    case 'name':
      return 'Searching customers';
    case 'occasion':
      return 'Searching experiences and orders';
    case 'template':
      return 'Searching experiences';
    default:
      return null;
  }
}
