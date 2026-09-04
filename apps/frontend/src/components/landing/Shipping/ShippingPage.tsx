import { LegalPage } from '@/components/landing/Legal';

import { SHIPPING_CTA, SHIPPING_HERO, SHIPPING_SECTIONS } from './shipping-content';

export function ShippingPage() {
  return (
    <LegalPage
      hero={SHIPPING_HERO}
      sections={SHIPPING_SECTIONS}
      cta={SHIPPING_CTA}
      contentAriaLabel="Shipping and delivery policy content"
      heroTitleId="shipping-hero-title"
      ctaTitleId="shipping-cta-title"
    />
  );
}
