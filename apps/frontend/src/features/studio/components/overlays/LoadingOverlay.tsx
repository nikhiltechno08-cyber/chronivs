'use client';

import { memo } from 'react';

type LoadingOverlayProps = {
  visible: boolean;
  message: string;
  progress: number;
  /** Skip fade-in — use on route loaders so the handoff stays black. */
  instant?: boolean;
};

export const LoadingOverlay = memo(function LoadingOverlay({
  visible,
  message,
  progress,
  instant = false,
}: LoadingOverlayProps) {
  return (
    <div
      className={`studio-loading-overlay ${visible ? 'show' : ''} ${instant ? 'instant' : ''}`}
      role="status"
      aria-live="polite"
      aria-busy={visible}
      aria-label="Creating your story"
    >
      <div className="max-w-[340px] px-5 text-center">
        <div className="relative mx-auto mb-[30px] h-16 w-16">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.1"
            className="h-full w-full animate-[spin_6s_linear_infinite] text-[var(--studio-gold)]"
            aria-hidden="true"
          >
            <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z" />
          </svg>
        </div>
        <h2 className="studio-serif text-[26px] font-normal text-[var(--studio-white)] italic">
          Creating your story...
        </h2>
        <p className="mt-3.5 min-h-5 text-[13.5px] text-[var(--studio-gray)] transition-opacity duration-250">
          {message}
        </p>
        <div className="mt-[34px] h-0.5 overflow-hidden rounded-sm bg-[var(--studio-line-soft)]">
          <i
            className="block h-full bg-gradient-to-r from-[var(--studio-gold)] to-[#f3dc9a] shadow-[0_0_12px_rgba(230,193,90,.6)] transition-[width] duration-150"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
      </div>
    </div>
  );
});
