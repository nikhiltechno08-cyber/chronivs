'use client';

import { motion } from 'framer-motion';
import { memo } from 'react';

function CheckMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-[11px] w-[11px]" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

type ChoiceCardProps = {
  selected: boolean;
  label: string;
  emoji?: string;
  compact?: boolean;
  disabled?: boolean;
  onSelect: () => void;
  ariaLabel?: string;
};

export const ChoiceCard = memo(function ChoiceCard({
  selected,
  label,
  emoji,
  compact = false,
  disabled = false,
  onSelect,
  ariaLabel,
}: ChoiceCardProps) {
  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-disabled={disabled}
      aria-label={ariaLabel ?? label}
      onClick={disabled ? undefined : onSelect}
      disabled={disabled}
      className={`studio-choice-card ${selected ? 'selected' : ''} ${disabled ? 'is-disabled' : ''}`}
      style={compact ? { padding: '24px 18px' } : undefined}
      whileHover={disabled ? undefined : { y: -5 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <span className="studio-choice-check" aria-hidden="true">
        <CheckMark />
      </span>
      {emoji && (
        <span className="studio-choice-emoji" aria-hidden="true">
          {emoji}
        </span>
      )}
      <span className="studio-choice-label">{label}</span>
    </motion.button>
  );
});
