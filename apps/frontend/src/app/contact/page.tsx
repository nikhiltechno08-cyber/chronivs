import { ContactPage } from '@/components/landing/Contact';
import { MarketingPageShell } from '@/components/landing/MarketingPageShell';
import { createPageMetadata, SITE_URL } from '@/constants/seo';

export const metadata = createPageMetadata(
  'Contact',
  'Get in touch with Chronivs for support, questions, or business partnerships. We respond within 24 hours.',
  {
    alternates: {
      canonical: `${SITE_URL}/contact`,
    },
    openGraph: {
      url: `${SITE_URL}/contact`,
      title: 'Contact Chronivs — Let\'s Create Something Beautiful Together',
      description:
        'Whether you need support, have questions or want to collaborate, we\'d love to hear from you.',
    },
  },
);

const contactJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact Chronivs',
  url: `${SITE_URL}/contact`,
  description:
    'Contact Chronivs for support, business inquiries, and partnership opportunities.',
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@chronivs.com',
      areaServed: 'IN',
      availableLanguage: 'English',
    },
    {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: 'business@chronivs.com',
      areaServed: 'IN',
      availableLanguage: 'English',
    },
  ],
};

export default function ContactRoutePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <MarketingPageShell>
        <ContactPage />
      </MarketingPageShell>
    </>
  );
}
