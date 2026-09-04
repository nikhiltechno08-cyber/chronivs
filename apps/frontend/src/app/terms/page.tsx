import { TermsPage } from '@/components/landing/Terms';
import { MarketingPageShell } from '@/components/landing/MarketingPageShell';
import { createPageMetadata, SITE_URL } from '@/constants/seo';

export const metadata = createPageMetadata(
  'Terms & Conditions',
  'Read the Chronivs Terms & Conditions covering eligibility, content responsibility, payments via Razorpay, refunds, acceptable use, and governing law in India.',
  {
    alternates: {
      canonical: `${SITE_URL}/terms`,
    },
    openGraph: {
      url: `${SITE_URL}/terms`,
      title: 'Chronivs Terms & Conditions',
      description: 'Please read these terms carefully before using Chronivs.',
    },
  },
);

const termsJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Chronivs Terms & Conditions',
  url: `${SITE_URL}/terms`,
  description:
    'Terms governing use of the Chronivs platform, digital experiences, payments, refunds, and user responsibilities.',
  isPartOf: {
    '@type': 'WebSite',
    name: 'Chronivs',
    url: SITE_URL,
  },
};

export default function TermsRoutePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(termsJsonLd) }}
      />
      <MarketingPageShell>
        <TermsPage />
      </MarketingPageShell>
    </>
  );
}
