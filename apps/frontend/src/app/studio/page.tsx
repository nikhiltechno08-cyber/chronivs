import type { Metadata } from 'next';
import { Suspense } from 'react';

import { LoadingFallback } from '@/components/layout';
import { StudioPage } from '@/features/studio';

export const metadata: Metadata = {
  title: 'Experience Studio — Chronivs',
  description: 'Create a cinematic, personal experience in minutes.',
};

export default function StudioRoutePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <LoadingFallback />
        </div>
      }
    >
      <StudioPage />
    </Suspense>
  );
}
