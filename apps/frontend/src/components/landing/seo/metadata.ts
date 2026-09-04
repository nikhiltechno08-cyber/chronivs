import type { Metadata } from 'next';

import { SITE_URL } from '@/constants/seo';

export const landingMetadata: Metadata = {
  title: "More Than A Gift. A Memory They'll Never Forget.",
  description:
    'Create unforgettable digital experiences powered by emotion — birthdays, anniversaries, proposals. Every special moment deserves more than a simple message.',
  keywords: [
    'digital experiences',
    'cinematic gifts',
    'birthday experience',
    'proposal website',
    'anniversary gift',
    'personalized memories',
    'Chronivs',
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Chronivs',
    title: "Chronivs — More Than A Gift. A Memory They'll Never Forget.",
    description:
      'Create unforgettable digital experiences powered by emotion — birthdays, anniversaries, proposals.',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Chronivs — More Than A Gift. A Memory They'll Never Forget.",
    description:
      'Create unforgettable digital experiences powered by emotion — birthdays, anniversaries, proposals.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const landingJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Chronivs',
      url: SITE_URL,
      description:
        'AI-powered platform for creating cinematic digital experiences for birthdays, anniversaries, proposals and special occasions.',
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Chronivs',
      publisher: { '@id': `${SITE_URL}/#organization` },
      description:
        "Create cinematic digital experiences — more than a gift, a memory they'll never forget.",
    },
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: "Chronivs — More Than A Gift. A Memory They'll Never Forget.",
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#organization` },
      description:
        'Create unforgettable digital experiences powered by emotion — birthdays, anniversaries, proposals.',
    },
  ],
};
