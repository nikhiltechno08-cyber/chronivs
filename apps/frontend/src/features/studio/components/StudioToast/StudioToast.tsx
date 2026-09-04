'use client';

import { memo } from 'react';

type StudioToastProps = {
  message: string;
  visible: boolean;
};

export const StudioToast = memo(function StudioToast({ message, visible }: StudioToastProps) {
  return (
    <div className={`studio-toast ${visible ? 'show' : ''}`} role="status" aria-live="polite">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-[var(--studio-gold)]" aria-hidden="true">
        <path d="M20 6L9 17l-5-5" />
      </svg>
      <span>{message}</span>
    </div>
  );
});
