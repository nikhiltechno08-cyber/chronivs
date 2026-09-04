'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { OCCASION_CONFIG } from '../../constants/occasions';
import { useStudioStore } from '../../store/studio-store';
import type { OccasionKey, RelationshipKey } from '../../types';
import { ChoiceCard } from '../ChoiceCard';
import { PanelHead } from '../Hero';

const SELECTION_ADVANCE_DELAY_MS = 220;

type RelationshipSelectorProps = {
  onContinue: () => void;
};

export const RelationshipSelector = memo(function RelationshipSelector({ onContinue }: RelationshipSelectorProps) {
  const occasion = useStudioStore((s) => s.occasion) as OccasionKey | null;
  const relationship = useStudioStore((s) => s.relationship);
  const setRelationship = useStudioStore((s) => s.setRelationship);
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
    (key: RelationshipKey) => {
      if (isLocked || !occasion) return;

      setIsLocked(true);
      setRelationship(key);

      advanceTimeoutRef.current = window.setTimeout(() => {
        onContinue();
      }, SELECTION_ADVANCE_DELAY_MS);
    },
    [isLocked, occasion, onContinue, setRelationship],
  );

  if (!occasion) return null;

  const config = OCCASION_CONFIG[occasion];

  return (
    <>
      <PanelHead
        eyebrow="The person"
        title={config.relHeadline}
        description="One tap, and we'll shape the whole experience around them."
      />
      <div
        className="studio-choice-grid grid grid-cols-3 gap-4"
        role="radiogroup"
        aria-label="Select relationship"
        aria-busy={isLocked}
      >
        {config.relationships.map((item) => (
          <ChoiceCard
            key={item.key}
            selected={relationship === item.key}
            label={item.label}
            compact
            disabled={isLocked}
            onSelect={() => handleSelect(item.key)}
          />
        ))}
      </div>
    </>
  );
});
