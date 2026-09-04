'use client';

import { Suspense } from 'react';

import type { LoadingBoundaryProps } from '@/types';

function DefaultLoadingFallback() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex min-h-[50vh] items-center justify-center"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-brand-500)] border-t-transparent" />
    </div>
  );
}

export function LoadingBoundary({ children, fallback }: LoadingBoundaryProps) {
  return <Suspense fallback={fallback ?? <DefaultLoadingFallback />}>{children}</Suspense>;
}

export function LoadingFallback() {
  return <DefaultLoadingFallback />;
}
