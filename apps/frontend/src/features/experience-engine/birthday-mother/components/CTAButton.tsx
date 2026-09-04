'use client';

import { memo } from 'react';

type CTAButtonProps = {
  children: React.ReactNode;
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
      className={`mb-cta ${show ? 'show' : ''} ${className}`}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
});
