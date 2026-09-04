import type { Metadata } from 'next';
import { Suspense } from 'react';

import { StudioPage } from '@/features/studio';

export const metadata: Metadata = {
  title: 'Experience Studio — Chronivs',
  description: 'Create a cinematic, personal experience in minutes.',
};

export default function StudioRoutePage() {
  return (
    <Suspense fallback={null}>
      <StudioPage />
    </Suspense>
  );
}
