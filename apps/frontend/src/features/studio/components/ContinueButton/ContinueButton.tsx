'use client';

import { motion } from 'framer-motion';
import { memo, type ReactNode } from 'react';

type ContinueButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  children?: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  type?: 'button' | 'submit';
  className?: string;
  ariaLabel?: string;
};

export const ContinueButton = memo(function ContinueButton({
  onClick,
  disabled = false,
  children = 'Continue',
  variant = 'primary',
  type = 'button',
  className = '',
  ariaLabel,
}: ContinueButtonProps) {
  const baseClass =
    variant === 'primary'
      ? 'studio-btn-primary'
      : variant === 'secondary'
        ? 'studio-btn-secondary'
        : 'studio-btn-ghost';

  if (variant === 'ghost') {
    return (
      <button type={type} onClick={onClick} className={`${baseClass} ${className}`} aria-label={ariaLabel}>
        {children}
      </button>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${className}`}
      aria-label={ariaLabel}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.button>
  );
});

type PanelActionsProps = {
  children: ReactNode;
  footer?: ReactNode;
};

export const PanelActions = memo(function PanelActions({ children, footer }: PanelActionsProps) {
  return (
    <div className="studio-panel-actions">
      <div className="studio-panel-actions-row flex flex-wrap justify-center gap-3.5">{children}</div>
      {footer}
    </div>
  );
});
