'use client';

import { memo, type ReactNode } from 'react';

type CTAButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  show?: boolean;
  className?: string;
  ariaLabel?: string;
};

export const CTAButton = memo(function CTAButton({
  children,
  onClick,
  show = true,
  className = '',
  ariaLabel,
}: CTAButtonProps) {
  return (
    <button
      type="button"
      className={`fb-cta ${show ? 'show' : ''} ${className}`}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
});
