'use client';

import { memo, useCallback, useState } from 'react';

import { DEFAULT_CONFIG } from '../constants/story';
import { SceneShell } from '../components/SceneShell';
import type { SceneComponentProps } from '../types';

const POSITIONS = [
  { left: 6, top: 60 },
  { left: 27, top: 20 },
  { left: 50, top: 60 },
  { left: 73, top: 20 },
  { left: 94, top: 60 },
];

const HEART_POSITIONS = [
  { left: 50, top: 10 },
  { left: 30, top: 0 },
  { left: 70, top: 0 },
  { left: 38, top: 30 },
  { left: 62, top: 30 },
];

export const CardsScene = memo(function CardsScene({ onNext, isActive }: SceneComponentProps) {
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [arranged, setArranged] = useState(false);
  const [showBtn, setShowBtn] = useState(false);
  const [hint, setHint] = useState('Tap each card to open it');

  const handleFlip = useCallback(
    (index: number) => {
      if (flipped.has(index) || arranged) return;
      const next = new Set(flipped);
      next.add(index);
      setFlipped(next);
      if (next.size === DEFAULT_CONFIG.reasons.length) {
        setHint('');
        window.setTimeout(() => {
          setArranged(true);
          setShowBtn(true);
        }, 700);
      }
    },
    [flipped, arranged],
  );

  if (!isActive) return null;

  return (
    <SceneShell id="scene-prop-cards">
      <p className="prop-eyebrow prop-reveal">The Reasons I Fell In Love</p>
      <div className="prop-cards-area">
        {DEFAULT_CONFIG.reasons.map((r, i) => {
          const pos = arranged ? HEART_POSITIONS[i]! : POSITIONS[i]!;
          const isFlipped = flipped.has(i);
          return (
            <div
              key={i}
              className={`prop-mem-card${isFlipped ? ' flipped' : ''}${arranged ? ' arranged' : ''}`}
              style={{
                left: `calc(${pos.left}% - 48px)`,
                top: `${pos.top}px`,
                transform: arranged ? 'rotateY(180deg) scale(0.82)' : undefined,
              }}
              onClick={() => handleFlip(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleFlip(i);
              }}
              role="button"
              tabIndex={0}
            >
              <div className="prop-face prop-front">
                <div className="prop-mark">{r.mark}</div>
              </div>
              <div className="prop-face prop-back">{r.text}</div>
            </div>
          );
        })}
      </div>
      {hint && <p className="prop-line">{hint}</p>}
      {showBtn && (
        <button type="button" className="prop-btn prop-reveal" onClick={onNext}>
          There&apos;s More…
        </button>
      )}
    </SceneShell>
  );
});
