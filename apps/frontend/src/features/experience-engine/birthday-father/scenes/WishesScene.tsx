'use client';

import { memo, useEffect, useMemo, useState, type CSSProperties, type MouseEvent } from 'react';

import { CTAButton } from '../components/CTAButton';
import { ExperienceModal } from '../components/ExperienceModal';
import { SceneShell } from '../components/SceneShell';
import { WISH_POSITIONS, WISHES } from '../constants/story';
import type { SceneComponentProps } from '../types';

type Trail = { id: number; from: number; to: number };

function pct(value: string) {
  return parseFloat(value);
}

export const WishesScene = memo(function WishesScene({ onNext, isActive }: SceneComponentProps) {
  const [collected, setCollected] = useState<Set<number>>(new Set());
  const [active, setActive] = useState<number | null>(null);
  const [trails, setTrails] = useState<Trail[]>([]);
  const [firework, setFirework] = useState(false);
  const [showCta, setShowCta] = useState(false);
  const [lastStar, setLastStar] = useState<number | null>(null);

  const sparks = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        angle: (i / 20) * 360,
        delay: (i % 5) * 0.04,
        dist: 70 + (i % 5) * 20,
      })),
    [],
  );

  useEffect(() => {
    if (!isActive) {
      setCollected(new Set());
      setActive(null);
      setTrails([]);
      setFirework(false);
      setShowCta(false);
      setLastStar(null);
      return;
    }
    const t = window.setTimeout(() => setShowCta(true), 6000);
    return () => clearTimeout(t);
  }, [isActive]);

  useEffect(() => {
    if (collected.size < WISHES.length) return;
    setFirework(true);
    setShowCta(true);
    const t = window.setTimeout(() => setFirework(false), 1800);
    return () => clearTimeout(t);
  }, [collected.size]);

  if (!isActive) return null;

  const openWish = (e: MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setActive(index);

    if (!collected.has(index)) {
      if (lastStar !== null) {
        setTrails((prev) => [...prev, { id: Date.now() + index, from: lastStar, to: index }]);
      }
      setLastStar(index);
      setCollected((prev) => new Set(prev).add(index));
    }
  };

  return (
    <SceneShell theme="night" id="scene-father-wishes" className="fb-wishes-shell">
      <span className="fb-chapter fb-chapter-light">Chapter Ten — The Wishes</span>
      <h1 className="fb-title" style={{ fontSize: 'clamp(20px,3.6vw,30px)', color: 'var(--ivory)' }}>
        Tap a star, <em style={{ color: 'var(--sun)' }}>make a wish.</em>
      </h1>

      <div className="fb-wish-sky">
        <svg className="fb-wish-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {trails.map((trail) => {
            const a = WISH_POSITIONS[trail.from]!;
            const b = WISH_POSITIONS[trail.to]!;
            return (
              <line
                key={trail.id}
                className="fb-wish-trail-line"
                x1={pct(a.left)}
                y1={pct(a.top)}
                x2={pct(b.left)}
                y2={pct(b.top)}
              />
            );
          })}
        </svg>

        {WISH_POSITIONS.map((pos, i) => (
          <button
            key={WISHES[i]}
            type="button"
            className={`fb-wish-dot ${collected.has(i) ? 'collected' : ''}`}
            style={{ top: pos.top, left: pos.left, animationDelay: `${i * 0.4}s` }}
            onClick={(e) => openWish(e, i)}
            aria-label={`Open wish ${i + 1}`}
          />
        ))}

        {firework && (
          <div className="fb-firework" aria-hidden="true">
            {sparks.map((spark) => (
              <span
                key={spark.id}
                className="fb-firework-spark"
                style={
                  {
                    '--angle': `${spark.angle}deg`,
                    '--dist': `${spark.dist}px`,
                    animationDelay: `${spark.delay}s`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        )}
      </div>

      <CTAButton show={showCta} onClick={onNext} className="fb-cta-contrast">
        Say Thank You
      </CTAButton>

      <ExperienceModal open={active !== null} onClose={() => setActive(null)} ariaLabel="Wish" glass>
        <p className="fb-glass-quote">{active !== null ? WISHES[active] : ''}</p>
        <button type="button" className="fb-modal-close" onClick={() => setActive(null)}>
          Close
        </button>
      </ExperienceModal>
    </SceneShell>
  );
});
