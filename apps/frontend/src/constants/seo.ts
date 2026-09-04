import type { Metadata, Viewport } from 'next';
import { APP_NAME } from '@chronivs/shared/constants';

export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description:
    'Create cinematic digital experiences for birthdays, proposals, anniversaries, and special occasions.',
  keywords: [
    'digital experiences',
    'cinematic',
    'birthday',
    'proposal',
    'anniversary',
    'personalized',
    'AI-powered',
  ],
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: APP_NAME,
    title: APP_NAME,
    description:
      'Create cinematic digital experiences for birthdays, proposals, anniversaries, and special occasions.',
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_NAME,
    description:
      'Create cinematic digital experiences for birthdays, proposals, anniversaries, and special occasions.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [{ url: '/icon', type: 'image/png', sizes: '32x32' }],
  },
};

export const defaultViewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0f' },
  ],
};

export function createPageMetadata(
  title: string,
  description?: string,
  overrides?: Partial<Metadata>,
): Metadata {
  return {
    title,
    description: description ?? defaultMetadata.description,
    openGraph: {
      title,
      description: description ?? (defaultMetadata.description as string),
    },
    twitter: {
      title,
      description: description ?? (defaultMetadata.description as string),
    },
    ...overrides,
  };
}
