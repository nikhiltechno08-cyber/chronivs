import { FAQ_ALL_ITEMS, FaqPage } from '@/components/landing/Faq';
import { MarketingPageShell } from '@/components/landing/MarketingPageShell';
import { createPageMetadata, SITE_URL } from '@/constants/seo';

export const metadata = createPageMetadata(
  'FAQ',
  'Find answers about creating Chronivs experiences, payments, customization, sharing, privacy, and technical support before you publish.',
  {
    alternates: {
      canonical: `${SITE_URL}/faq`,
    },
    openGraph: {
      url: `${SITE_URL}/faq`,
      title: 'Chronivs FAQ — Everything You Need to Know',
      description:
        'Find answers before creating your experience — payments, customization, sharing, privacy, and more.',
    },
  },
);

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ALL_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

export default function FaqRoutePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <MarketingPageShell>
        <FaqPage />
      </MarketingPageShell>
    </>
  );
}
