import { LegalPage } from '@/components/landing/Legal';

import { TERMS_CTA, TERMS_HERO, TERMS_SECTIONS } from './terms-content';

export function TermsPage() {
  return (
    <LegalPage
      hero={TERMS_HERO}
      sections={TERMS_SECTIONS}
      cta={TERMS_CTA}
      contentAriaLabel="Terms and conditions content"
      heroTitleId="terms-hero-title"
      ctaTitleId="terms-cta-title"
    />
  );
}
