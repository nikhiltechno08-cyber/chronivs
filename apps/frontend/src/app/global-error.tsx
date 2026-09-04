'use client';

import { useEffect } from 'react';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('[Global Error]', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased">
        <div role="alert" className="flex min-h-dvh flex-col items-center justify-center p-8">
          <p className="text-sm font-medium uppercase tracking-wider text-neutral-500">500</p>
          <h1 className="mt-2 text-lg font-semibold text-neutral-900">Something went wrong</h1>
          <p className="mt-2 max-w-md text-center text-sm text-neutral-600">
            An unexpected error occurred. Please try again.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 rounded-md bg-neutral-900 px-4 py-2 text-sm text-white"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
