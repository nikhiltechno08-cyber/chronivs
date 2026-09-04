'use client';

import { memo } from 'react';

type TapToBeginOverlayProps = {
  visible: boolean;
  onBegin: () => void;
};

/**
 * Elegant unlock gate when autoplay is blocked.
 * Does not surface browser autoplay errors.
 */
export const TapToBeginOverlay = memo(function TapToBeginOverlay({
  visible,
  onBegin,
}: TapToBeginOverlayProps) {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0b0407]/88 px-6 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Tap to begin experience"
    >
      <button
        type="button"
        onClick={onBegin}
        className="group flex max-w-[320px] flex-col items-center gap-4 rounded-[24px] border border-[rgba(230,193,90,0.28)] bg-[rgba(255,255,255,0.04)] px-8 py-10 text-center text-[#f7ecdd] outline-none transition hover:border-[rgba(230,193,90,0.55)] focus-visible:ring-2 focus-visible:ring-[#e6c15a]"
      >
        <span className="text-3xl transition group-hover:scale-110" aria-hidden="true">
          ▶
        </span>
        <span className="font-[Georgia,'Times_New_Roman',serif] text-[1.45rem] italic leading-snug">
          Tap to Begin
        </span>
        <span className="text-xs tracking-[0.18em] uppercase text-[#cbb6a4]/80">
          Your story is ready
        </span>
      </button>
    </div>
  );
});
