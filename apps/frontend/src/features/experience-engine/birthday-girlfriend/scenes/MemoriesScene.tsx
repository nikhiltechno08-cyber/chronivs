'use client';

import { memo, useEffect, useMemo, useState } from 'react';

import { CTAButton } from '../components/CTAButton';
import { MemoryCard } from '../components/MemoryCard';
import { SceneContainer } from '../components/SceneContainer';
import { HEART_MEMORY_POSITIONS, MEMORY_NOTES_DEFAULT } from '../constants/story';
import type { SceneComponentProps } from '../types';

export const MemoriesScene = memo(function MemoriesScene({ data, onNext, isActive }: SceneComponentProps) {
  const [showCta, setShowCta] = useState(false);
  const [activeMemory, setActiveMemory] = useState<number | null>(null);
  const [openedHearts, setOpenedHearts] = useState<Set<number>>(new Set());

  const notes = useMemo(() => {
    return MEMORY_NOTES_DEFAULT.map((defaultNote, i) => {
      if (data.customMessage && i === 0) {
        const snippet = data.customMessage.split('.').filter(Boolean)[0];
        return snippet ? `${snippet.trim()}.` : defaultNote;
      }
      return defaultNote;
    });
  }, [data.customMessage]);

  useEffect(() => {
    if (!isActive) {
      setShowCta(false);
      return;
    }
    const t = window.setTimeout(() => setShowCta(true), 900);
    return () => clearTimeout(t);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <SceneContainer id="scene-memories">
      <div className="eyebrow">Our Memories</div>
      <h1 className="serif" style={{ marginBottom: 6 }}>
        A Little Tree of <em>Us</em>
      </h1>
      <p className="sub" style={{ marginBottom: 6 }}>
        Tap a heart to open a memory.
      </p>
      <div className="tree-wrap" id="treeWrap">
        <svg className="branches" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M50 100 C50 90 50 84 50 76" stroke="rgba(216,163,120,0.65)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M50 76 C50 58 49 34 48 16" stroke="rgba(216,163,120,0.55)" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          <path d="M50 80 C60 65 68 48 76 34" stroke="rgba(216,163,120,0.55)" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          <path d="M50 84 C38 76 26 60 20 46" stroke="rgba(216,163,120,0.55)" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          <path d="M50 90 C38 84 28 76 24 66" stroke="rgba(216,163,120,0.5)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M50 92 C58 86 62 78 66 70" stroke="rgba(216,163,120,0.5)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </svg>
        {HEART_MEMORY_POSITIONS.map((pos, i) => (
          <button
            key={i}
            type="button"
            className={`heart-node ${openedHearts.has(i) ? 'opened' : ''}`}
            style={{
              left: pos.left,
              top: pos.top,
              animationDelay: `${pos.delay}s`,
            }}
            onClick={() => {
              setActiveMemory(i);
              setOpenedHearts((prev) => new Set(prev).add(i));
            }}
            aria-label={`Open memory ${i + 1}`}
          >
            ❤
          </button>
        ))}
      </div>
      <CTAButton show={showCta} onClick={onNext}>
        One More Memory
      </CTAButton>
      <MemoryCard
        visible={activeMemory !== null}
        note={activeMemory !== null ? notes[activeMemory]! : ''}
        photoUrl={data.photos[(activeMemory ?? 0) + 2]}
        photoIndex={((activeMemory ?? 0) + 2) as 0 | 1 | 2 | 3 | 4}
        onClose={() => setActiveMemory(null)}
      />
    </SceneContainer>
  );
});
