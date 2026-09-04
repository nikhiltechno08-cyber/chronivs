'use client';

import { useEffect } from 'react';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('[App Error]', error);
  }, [error]);

  return (
    <div role="alert" className="flex min-h-dvh flex-col items-center justify-center p-8">
      <h2 className="text-lg font-semibold text-[var(--color-fg-primary)]">
        Something went wrong
      </h2>
      <p className="mt-2 max-w-md text-center text-sm text-[var(--color-fg-muted)]">
        {error.message}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-md bg-[var(--color-brand-600)] px-4 py-2 text-sm text-white"
      >
        Try again
      </button>
    </div>
  );
}
