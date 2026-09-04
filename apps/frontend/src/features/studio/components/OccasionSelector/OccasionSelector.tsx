'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { OCCASIONS } from '../../constants/occasions';
import { useStudioStore } from '../../store/studio-store';
import type { OccasionKey } from '../../types';
import { ChoiceCard } from '../ChoiceCard';
import { PanelHead } from '../Hero';

const SELECTION_ADVANCE_DELAY_MS = 220;

type OccasionSelectorProps = {
  onContinue: () => void;
};

export const OccasionSelector = memo(function OccasionSelector({ onContinue }: OccasionSelectorProps) {
  const occasion = useStudioStore((s) => s.occasion);
  const setOccasion = useStudioStore((s) => s.setOccasion);
  const [isLocked, setIsLocked] = useState(false);
  const advanceTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (advanceTimeoutRef.current !== null) {
        window.clearTimeout(advanceTimeoutRef.current);
      }
    };
  }, []);

  const handleSelect = useCallback(
    (key: OccasionKey) => {
      if (isLocked) return;

      setIsLocked(true);
      setOccasion(key);

      advanceTimeoutRef.current = window.setTimeout(() => {
        onContinue();
      }, SELECTION_ADVANCE_DELAY_MS);
    },
    [isLocked, onContinue, setOccasion],
  );

  return (
    <>
      <PanelHead
        eyebrow="Begin the story"
        title="What are we celebrating today?"
        description="Let's create something they'll never forget."
      />
      <div
        className="studio-choice-grid grid grid-cols-3 gap-4"
        role="radiogroup"
        aria-label="Select occasion"
        aria-busy={isLocked}
      >
        {OCCASIONS.map((item) => (
          <ChoiceCard
            key={item.key}
            selected={occasion === item.key}
            emoji={item.emoji}
            label={item.label}
            disabled={isLocked}
            onSelect={() => handleSelect(item.key)}
          />
        ))}
      </div>
    </>
  );
});
