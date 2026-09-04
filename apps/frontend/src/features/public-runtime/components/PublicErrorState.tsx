'use client';

import Link from 'next/link';
import { memo } from 'react';

import type { PublicRuntimeErrorKind } from '../services/publicRuntimeApi';

const COPY: Record<
  PublicRuntimeErrorKind,
  { title: string; body: string }
> = {
  invalid: {
    title: 'This link looks incomplete',
    body: 'The experience address may be mistyped. Ask the sender for a fresh Chronivs link.',
  },
  not_found: {
    title: 'Experience not found',
    body: 'We couldn’t find a published story at this address. It may have been removed.',
  },
  deleted: {
    title: 'This story has been taken down',
    body: 'The experience is no longer available. Reach out to the person who shared it with you.',
  },
  expired: {
    title: 'This link has expired',
    body: 'Time-limited experiences fade after their window. Ask the sender for a new invite.',
  },
  unavailable: {
    title: 'Temporarily unavailable',
    body: 'Something gentle went wrong while opening this story. Please try again in a moment.',
  },
  network: {
    title: 'Connection needed',
    body: 'Check your network, then open the link again to begin the experience.',
  },
};

type PublicErrorStateProps = {
  kind: PublicRuntimeErrorKind;
  message?: string;
};

export const PublicErrorState = memo(function PublicErrorState({
  kind,
  message,
}: PublicErrorStateProps) {
  const copy = COPY[kind] ?? COPY.unavailable;

  return (
    <main
      role="alert"
      className="flex min-h-dvh flex-col items-center justify-center bg-[#0b0407] px-6 py-16 text-center text-[#f7ecdd]"
    >
      <div className="max-w-[420px]">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[#e6c15a]">Chronivs</p>
        <h1 className="mt-4 font-[Georgia,'Times_New_Roman',serif] text-[clamp(1.6rem,4vw,2.1rem)] italic leading-snug">
          {copy.title}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[#cbb6a4]">
          {message && kind === 'unavailable' ? message : copy.body}
        </p>
        <Link
          href="/"
          className="mt-10 inline-flex items-center justify-center rounded-full bg-gradient-to-b from-[#f3dc9a] to-[#e6c15a] px-6 py-3 text-sm font-semibold text-[#2a1a0a]"
        >
          Visit Chronivs
        </Link>
      </div>
    </main>
  );
});
