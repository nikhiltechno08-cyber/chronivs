import { RefundPage } from '@/components/landing/Refund';
import { MarketingPageShell } from '@/components/landing/MarketingPageShell';
import { createPageMetadata, SITE_URL } from '@/constants/seo';

export const metadata = createPageMetadata(
  'Refund Policy',
  'Chronivs refund policy for personalized digital experiences — eligibility, non-refundable situations, payment failures, and support within 24 hours.',
  {
    alternates: {
      canonical: `${SITE_URL}/refund-policy`,
    },
    openGraph: {
      url: `${SITE_URL}/refund-policy`,
      title: 'Chronivs Refund Policy',
      description: 'Our refund policy for personalized digital experiences.',
    },
  },
);

const refundJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Chronivs Refund Policy',
  url: `${SITE_URL}/refund-policy`,
  description:
    'Refund policy for Chronivs personalized digital experiences including eligibility, non-refundable cases, and payment failure handling.',
  isPartOf: {
    '@type': 'WebSite',
    name: 'Chronivs',
    url: SITE_URL,
  },
};

export default function RefundPolicyRoutePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(refundJsonLd) }}
      />
      <MarketingPageShell>
        <RefundPage />
      </MarketingPageShell>
    </>
  );
}
