import { LegalPage } from '@/components/landing/Legal';

import { PRIVACY_CTA, PRIVACY_HERO, PRIVACY_SECTIONS } from './privacy-content';

export function PrivacyPage() {
  return (
    <LegalPage
      hero={PRIVACY_HERO}
      sections={PRIVACY_SECTIONS}
      cta={PRIVACY_CTA}
      contentAriaLabel="Privacy policy content"
      heroTitleId="privacy-hero-title"
      ctaTitleId="privacy-cta-title"
    />
  );
}
