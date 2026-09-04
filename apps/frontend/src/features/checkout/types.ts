export type CheckoutStatus =
  | 'idle'
  | 'editing'
  | 'submitting'
  | 'ready_for_payment'
  | 'processing_payment'
  | 'payment_success'
  | 'payment_failed'
  | 'payment_cancelled'
  | 'error';

export type CheckoutFormFields = {
  customerName: string;
  email: string;
  mobile: string;
  couponCode: string;
};

export type CheckoutOrderSummary = {
  templateName: string;
  templateId: string;
  occasion: string;
  relationship: string;
  price: number;
  discount: number;
  total: number;
  currency: string;
};

export type CheckoutSession = {
  checkoutUuid: string;
  experienceUuid: string;
  amount: number;
  discountAmount: number;
  total: number;
  currency: string;
  status: string;
};

export type CheckoutState = CheckoutFormFields & {
  isOpen: boolean;
  status: CheckoutStatus;
  errorMessage: string | null;
  fieldErrors: Partial<Record<keyof CheckoutFormFields, string>>;
  shakingFields: Partial<Record<keyof CheckoutFormFields, boolean>>;
  orderSummary: CheckoutOrderSummary | null;
  experienceId: string | null;
  checkoutSession: CheckoutSession | null;
};

export type CreateCheckoutPayload = {
  customer_name: string;
  email: string;
  mobile: string;
  coupon_code?: string | null;
  template_name?: string | null;
  template_slug?: string | null;
  occasion?: string | null;
  relationship?: string | null;
  /** Backend sectioned experience_data JSON (mapped from FE ExperienceData) */
  experience_data?: Record<string, unknown> | null;
  /** Pre-created experience from POST /experiences */
  experience_uuid?: string | null;
};

export type CreateCheckoutResponse = {
  checkout_uuid: string;
  experience_uuid: string;
  amount: number | string;
  discount_amount: number | string;
  total: number | string;
  currency: string;
  status: string;
  customer_name: string;
  email: string;
  mobile: string;
  coupon_code?: string | null;
  template_name?: string | null;
  occasion?: string | null;
  relationship?: string | null;
  created_at: string;
};
