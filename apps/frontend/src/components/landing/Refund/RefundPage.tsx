import { LegalPage } from '@/components/landing/Legal';

import { REFUND_CTA, REFUND_HERO, REFUND_SECTIONS } from './refund-content';

export function RefundPage() {
  return (
    <LegalPage
      hero={REFUND_HERO}
      sections={REFUND_SECTIONS}
      cta={REFUND_CTA}
      contentAriaLabel="Refund policy content"
      heroTitleId="refund-hero-title"
      ctaTitleId="refund-cta-title"
    />
  );
}
