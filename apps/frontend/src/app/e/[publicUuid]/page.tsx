import type { Metadata } from 'next';

import { PublicRuntimeApp } from '@/features/public-runtime';

export const metadata: Metadata = {
  title: 'Chronivs Experience',
  description: 'A cinematic personal experience, crafted just for you.',
  robots: { index: false, follow: false },
};

/**
 * Public recipient runtime — completely separate from Studio / Preview / Checkout.
 * Route: /e/[public_uuid]
 */
export default function PublicExperiencePage() {
  return <PublicRuntimeApp />;
}
