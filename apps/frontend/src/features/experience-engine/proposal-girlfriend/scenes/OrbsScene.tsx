'use client';

import { memo, useState } from 'react';

import { DEFAULT_CONFIG } from '../constants/story';
import { SceneShell } from '../components/SceneShell';
import type { SceneComponentProps } from '../types';

export const OrbsScene = memo(function OrbsScene({ onNext, isActive }: SceneComponentProps) {
  const words = DEFAULT_CONFIG.wonderWords;
  const [popped, setPopped] = useState<Set<number>>(new Set());
  const [strip, setStrip] = useState('');
  const [showBtn, setShowBtn] = useState(false);

  const handlePop = (index: number) => {
    if (popped.has(index)) return;
    const next = new Set(popped);
    next.add(index);
    setPopped(next);
    // Always reveal in wonderWords order, regardless of which orb was tapped.
    const newStrip = words.filter((_, i) => next.has(i)).join(' ');
    setStrip(newStrip);
    if (next.size === words.length) {
      setShowBtn(true);
    }
  };

  if (!isActive) return null;

  return (
    <SceneShell id="scene-prop-orbs">
      <p className="prop-eyebrow prop-reveal">A Little Magic</p>
      <p className="prop-line">Touch the light, one by one.</p>
      <div className="prop-orb-field">
        {words.map((_, i) => (
          <div
            key={i}
            className={`prop-orb${popped.has(i) ? ' popped' : ''}`}
            style={{
              left: `calc(${(i / (words.length - 1)) * 88}%)`,
              top: i % 2 === 0 ? 20 : 90,
              animationDelay: `${i * 0.3}s`,
            }}
            onClick={() => handlePop(i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handlePop(i);
            }}
            role="button"
            tabIndex={0}
            aria-label={`Reveal word ${i + 1}`}
          />
        ))}
      </div>
      <div className="prop-word-strip">{strip}</div>
      {showBtn && (
        <button type="button" className="prop-btn prop-reveal" onClick={onNext}>
          Keep Going
        </button>
      )}
    </SceneShell>
  );
});
