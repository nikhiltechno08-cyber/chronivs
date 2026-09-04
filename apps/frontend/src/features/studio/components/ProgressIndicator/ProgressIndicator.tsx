'use client';

import Link from 'next/link';
import { memo } from 'react';

import { TOTAL_STUDIO_STEPS, getStudioStepPosition, type StudioStep } from '../../types';
import { useStudioStore } from '../../store/studio-store';

type ProgressIndicatorProps = {
  step: StudioStep;
};

export const ProgressIndicator = memo(function ProgressIndicator({ step }: ProgressIndicatorProps) {
  const position = getStudioStepPosition(step);
  const progress = (position / TOTAL_STUDIO_STEPS) * 100;

  return (
    <div
      className="mx-auto mt-3.5 h-0.5 max-w-[640px] overflow-hidden rounded-sm bg-[var(--studio-line-soft)]"
      role="progressbar"
      aria-valuenow={position}
      aria-valuemin={1}
      aria-valuemax={TOTAL_STUDIO_STEPS}
      aria-label={`Step ${position} of ${TOTAL_STUDIO_STEPS}`}
    >
      <div
        className="h-full rounded-sm bg-gradient-to-r from-[var(--studio-gold)] to-[#f3dc9a] transition-[width] duration-700 ease-[var(--studio-ease)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
});

type StudioNavProps = {
  onBack: () => void;
};

export const StudioNav = memo(function StudioNav({ onBack }: StudioNavProps) {
  const step = useStudioStore((s) => s.step);

  return (
    <nav
      aria-label="Studio navigation"
      className="fixed top-0 right-0 left-0 z-50 bg-gradient-to-b from-[rgba(9,9,9,.9)] to-transparent px-7 pt-[max(20px,env(safe-area-inset-top))] pb-4 backdrop-blur-[6px] max-[430px]:px-5"
    >
      <div className="mx-auto flex max-w-[640px] items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          disabled={step === 1}
          aria-hidden={step === 1}
          tabIndex={step === 1 ? -1 : 0}
          className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[var(--studio-line)] text-[var(--studio-gray)] transition-colors hover:border-[rgba(230,193,90,.4)] hover:bg-[var(--studio-gold-soft)] hover:text-[var(--studio-gold)] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--studio-gold)] disabled:pointer-events-none disabled:opacity-0"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-[15px] w-[15px]" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>

        <div className="flex items-center gap-2.5">
          <Link href="/" className="studio-serif text-[18px] font-medium text-[var(--studio-white)] italic">
            Chronivs
          </Link>
          <span className="studio-mono rounded-full border border-[var(--studio-line)] bg-[rgba(255,255,255,.02)] px-3.5 py-1.5 text-[11px] tracking-[0.08em] text-[var(--studio-gray)]">
            Step {getStudioStepPosition(step)} of {TOTAL_STUDIO_STEPS}
          </span>
        </div>

        {/* Spacer mirrors back button width so the logo stays centered */}
        <div className="h-11 w-11" aria-hidden="true" />
      </div>
      <ProgressIndicator step={step} />
    </nav>
  );
});