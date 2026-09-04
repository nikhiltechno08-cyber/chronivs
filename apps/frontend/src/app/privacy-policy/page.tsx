import { PrivacyPage } from '@/components/landing/Privacy';
import { MarketingPageShell } from '@/components/landing/MarketingPageShell';
import { createPageMetadata, SITE_URL } from '@/constants/seo';

export const metadata = createPageMetadata(
  'Privacy Policy',
  'How Chronivs collects, uses, stores, and protects your information — including Cloudinary media storage, Razorpay payments, cookies, and your privacy rights.',
  {
    alternates: {
      canonical: `${SITE_URL}/privacy-policy`,
    },
    openGraph: {
      url: `${SITE_URL}/privacy-policy`,
      title: 'Chronivs Privacy Policy — Your Privacy Matters',
      description:
        'We\'re committed to protecting your personal information while helping you create unforgettable digital experiences.',
    },
  },
);

const privacyJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Chronivs Privacy Policy',
  url: `${SITE_URL}/privacy-policy`,
  description:
    'Chronivs privacy policy covering data collection, Cloudinary storage, Razorpay payments, cookies, security, and user rights.',
  isPartOf: {
    '@type': 'WebSite',
    name: 'Chronivs',
    url: SITE_URL,
  },
};

export default function PrivacyPolicyRoutePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(privacyJsonLd) }}
      />
      <MarketingPageShell>
        <PrivacyPage />
      </MarketingPageShell>
    </>
  );
}
