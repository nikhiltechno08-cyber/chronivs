'use client';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { CTAButton } from '../components/CTAButton';
import { SceneShell } from '../components/SceneShell';
import { STAR_POSITIONS, STAR_WISHES } from '../constants/story';
import type { SceneComponentProps } from '../types';

export const ConstellationScene = memo(function ConstellationScene({ onNext, isActive }: SceneComponentProps) {
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [showCta, setShowCta] = useState(false);
  const [clickedOrder, setClickedOrder] = useState<number[]>([]);

  const connectionPath = useMemo(() => {
    if (clickedOrder.length < 2) return '';
    let path = '';
    for (let i = 1; i < clickedOrder.length; i++) {
      const prev = STAR_POSITIONS[clickedOrder[i - 1]!]!;
      const curr = STAR_POSITIONS[clickedOrder[i]!]!;
      path += `M${prev[0]},${prev[1]} L${curr[0]},${curr[1]} `;
    }
    return path;
  }, [clickedOrder]);

  useEffect(() => {
    if (!isActive) {
      setActiveCard(null);
      setShowCta(false);
      setClickedOrder([]);
      return;
    }
  }, [isActive]);

  const handleStarClick = useCallback((index: number) => {
    setActiveCard(index);
    setClickedOrder((prev) => {
      if (prev.includes(index)) return prev;
      const next = [...prev, index];
      if (next.length === STAR_WISHES.length) {
        window.setTimeout(() => setShowCta(true), 800);
      }
      return next;
    });
  }, []);

  if (!isActive) return null;

  return (
    <SceneShell id="scene-wife-stars" dark>
      <div className="aw-eyebrow aw-eyebrow-champagne">OUR LOVE, WRITTEN IN THE STARS</div>
      <h1 className="aw-title aw-title-sm aw-title-light">Tap a star.</h1>
      <div className="aw-sky">
        <svg className="aw-constline" viewBox="0 0 100 100" preserveAspectRatio="none">
          {connectionPath && <path className="aw-constline-path" d={connectionPath} />}
        </svg>
        {STAR_WISHES.map((wish, i) => {
          const pos = STAR_POSITIONS[i]!;
          const isLit = clickedOrder.includes(i);
          return (
            <button
              key={wish.quote}
              type="button"
              className={`aw-star ${isLit ? 'aw-star-lit' : ''}`}
              style={{
                left: `${pos[0]}%`,
                top: `${pos[1]}%`,
                animationDelay: `${i * 0.4}s`,
              }}
              onClick={() => handleStarClick(i)}
              aria-label={wish.quote}
            />
          );
        })}
        {STAR_WISHES.map((wish, i) => (
          <div key={`card-${i}`} className={`aw-star-card ${activeCard === i ? 'show' : ''}`}>
            <div className="aw-star-card-icon">{wish.icon}</div>
            <div className="aw-star-card-q">{wish.quote}</div>
            <button type="button" className="aw-star-card-close" onClick={() => setActiveCard(null)}>
              Close
            </button>
          </div>
        ))}
      </div>
      <CTAButton show={showCta} onClick={onNext} small>
        Continue
      </CTAButton>
    </SceneShell>
  );
});
