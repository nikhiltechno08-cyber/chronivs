import { ShippingPage } from '@/components/landing/Shipping';
import { MarketingPageShell } from '@/components/landing/MarketingPageShell';
import { createPageMetadata, SITE_URL } from '@/constants/seo';

export const metadata = createPageMetadata(
  'Shipping & Delivery Policy',
  'How Chronivs delivers digital experiences instantly — no physical shipping, shareable links, delivery times, and support for failed delivery.',
  {
    alternates: {
      canonical: `${SITE_URL}/shipping-delivery`,
    },
    openGraph: {
      url: `${SITE_URL}/shipping-delivery`,
      title: 'Chronivs Shipping & Delivery Policy',
      description:
        'Chronivs delivers digital experiences instantly—no physical shipping required.',
    },
  },
);

const shippingJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Chronivs Shipping & Delivery Policy',
  url: `${SITE_URL}/shipping-delivery`,
  description:
    'Digital delivery policy for Chronivs personalized experiences — instant link delivery, sharing, delays, and no physical shipment.',
  isPartOf: {
    '@type': 'WebSite',
    name: 'Chronivs',
    url: SITE_URL,
  },
};

export default function ShippingDeliveryRoutePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(shippingJsonLd) }}
      />
      <MarketingPageShell>
        <ShippingPage />
      </MarketingPageShell>
    </>
  );
}
