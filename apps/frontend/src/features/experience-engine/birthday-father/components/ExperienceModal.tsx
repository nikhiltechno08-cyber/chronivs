'use client';

import { memo, useCallback, useEffect, useState, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type ExperienceModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  ariaLabel?: string;
  glass?: boolean;
};

function resolvePortalRoot(): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  // Mount under .fb-app (outside Framer Motion scene transforms) but inside
  // .father-experience so CSS variables still apply.
  return (
    document.querySelector<HTMLElement>('.father-experience .fb-app') ??
    document.querySelector<HTMLElement>('.father-experience') ??
    document.body
  );
}

/** Portal modals outside motion scene transforms so fixed overlays stay stable */
export const ExperienceModal = memo(function ExperienceModal({
  open,
  onClose,
  children,
  ariaLabel = 'Dialog',
  glass = false,
}: ExperienceModalProps) {
  const [mounted, setMounted] = useState(false);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
    setPortalRoot(resolvePortalRoot());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const handleBackdrop = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    },
    [onClose],
  );

  if (!mounted || !open || !portalRoot) return null;

  return createPortal(
    <div
      className={`fb-modal ${glass ? 'fb-modal-glass' : ''} show`}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onClick={handleBackdrop}
    >
      <div
        className={glass ? 'fb-glass-card' : 'fb-modal-card'}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {children}
      </div>
    </div>,
    portalRoot,
  );
});
