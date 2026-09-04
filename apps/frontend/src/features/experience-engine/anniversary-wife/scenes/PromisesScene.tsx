'use client';

import { memo, useEffect, useState } from 'react';

import { CTAButton } from '../components/CTAButton';
import { SceneShell } from '../components/SceneShell';
import { PROMISES } from '../constants/story';
import type { SceneComponentProps } from '../types';

export const PromisesScene = memo(function PromisesScene({ onNext, isActive }: SceneComponentProps) {
  const [flipped, setFlipped] = useState<boolean[]>(() => PROMISES.map(() => false));
  const [showHeart, setShowHeart] = useState(false);
  const [hideCards, setHideCards] = useState(false);
  const [showCta, setShowCta] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setFlipped(PROMISES.map(() => false));
      setShowHeart(false);
      setHideCards(false);
      setShowCta(false);
    }
  }, [isActive]);

  const handleCardClick = (idx: number) => {
    if (flipped[idx]) return;
    const next = [...flipped];
    next[idx] = true;
    setFlipped(next);
    if (next.every(Boolean)) {
      window.setTimeout(() => {
        setHideCards(true);
        setShowHeart(true);
        window.setTimeout(() => setShowCta(true), 500);
      }, 500);
    }
  };

  if (!isActive) return null;

  return (
    <SceneShell id="scene-wife-promises">
      <div className="aw-eyebrow">MY PROMISES</div>
      <h1 className="aw-title aw-title-sm">
        Five promises, <em>whispered.</em>
      </h1>
      <div className="aw-cards-field">
        {PROMISES.map((promise, i) => (
          <button
            key={promise}
            type="button"
            className={`aw-p-card ${flipped[i] ? 'flipped' : ''} ${hideCards ? 'hide' : ''}`}
            style={{ ['--ry' as string]: `${(i - 2) * 4}deg` }}
            onClick={() => handleCardClick(i)}
            aria-label={promise}
          >
            <div className="aw-p-card-inner">
              <div className="aw-p-face aw-p-front">💌</div>
              <div className="aw-p-face aw-p-back">{promise}</div>
            </div>
          </button>
        ))}
      </div>
      <div className={`aw-combined-heart ${showHeart ? 'show' : ''}`}>❤</div>
      <CTAButton show={showCta} onClick={onNext} small>
        Our Love Keeps Growing
      </CTAButton>
    </SceneShell>
  );
});
