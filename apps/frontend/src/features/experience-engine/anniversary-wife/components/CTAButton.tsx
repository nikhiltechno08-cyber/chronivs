'use client';

import { memo, type ReactNode } from 'react';

import { spawnMiniHearts } from './CelebrationFx';

type CTAButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  show?: boolean;
  className?: string;
  ariaLabel?: string;
  small?: boolean;
  spawnHearts?: boolean;
};

export const CTAButton = memo(function CTAButton({
  children,
  onClick,
  show = true,
  className = '',
  ariaLabel,
  small = false,
  spawnHearts = false,
}: CTAButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (spawnHearts) spawnMiniHearts(e.currentTarget);
    onClick?.();
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (spawnHearts) spawnMiniHearts(e.currentTarget);
  };

  return (
    <button
      type="button"
      className={`aw-cta ${small ? 'aw-cta-small' : ''} ${show ? 'aw-cta-show' : ''} ${className}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
});
