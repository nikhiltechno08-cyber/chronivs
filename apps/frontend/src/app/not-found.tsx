import Link from 'next/link';

import { createPageMetadata } from '@/constants/seo';

export const metadata = createPageMetadata(
  'Page not found',
  'The page you are looking for does not exist or may have moved.',
);

export default function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center p-8">
      <p className="text-sm font-medium uppercase tracking-wider text-[var(--color-fg-muted)]">
        404
      </p>
      <h1 className="mt-2 text-lg font-semibold text-[var(--color-fg-primary)]">Page not found</h1>
      <p className="mt-2 max-w-md text-center text-sm text-[var(--color-fg-muted)]">
        The page you are looking for does not exist or may have moved.
      </p>
      <Link
        href="/"
        className="mt-4 rounded-md bg-[var(--color-brand-600)] px-4 py-2 text-sm text-white"
      >
        Back to home
      </Link>
    </div>
  );
}
