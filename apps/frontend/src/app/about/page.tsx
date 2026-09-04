import { AboutPage } from '@/components/landing/About';
import { MarketingPageShell } from '@/components/landing/MarketingPageShell';
import { createPageMetadata, SITE_URL } from '@/constants/seo';

export const metadata = createPageMetadata(
  'About',
  'Discover the story behind Chronivs — crafting unforgettable digital experiences for birthdays, anniversaries, proposals and life\'s most meaningful moments.',
  {
    alternates: {
      canonical: `${SITE_URL}/about`,
    },
    openGraph: {
      url: `${SITE_URL}/about`,
      title: 'About Chronivs — Creating Memories Worth Revisiting',
      description:
        'Chronivs helps people celebrate life\'s biggest moments through beautifully crafted digital experiences that go beyond ordinary greeting cards.',
    },
  },
);

export default function AboutRoutePage() {
  return (
    <MarketingPageShell>
      <AboutPage />
    </MarketingPageShell>
  );
}
