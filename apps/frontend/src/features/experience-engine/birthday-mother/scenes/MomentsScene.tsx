'use client';

import { memo, useEffect, useState } from 'react';

import { CTAButton } from '../components/CTAButton';
import { PhotoFace } from '../components/PhotoFace';
import { SceneShell } from '../components/SceneShell';
import { MOMENT_CAPTIONS, MOMENT_POSITIONS, resolveMotherPhotos } from '../constants/story';
import type { PhotoSlotIndex, SceneComponentProps } from '../types';

export const MomentsScene = memo(function MomentsScene({ data, onNext, isActive }: SceneComponentProps) {
  const photos = resolveMotherPhotos(data.photos);
  const [active, setActive] = useState<number | null>(null);
  const [opened, setOpened] = useState<Set<number>>(new Set());
  const [showCta, setShowCta] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setActive(null);
      setOpened(new Set());
      setShowCta(false);
      return;
    }
    const t = window.setTimeout(() => setShowCta(true), 4500);
    return () => clearTimeout(t);
  }, [isActive]);

  useEffect(() => {
    if (opened.size >= 2) setShowCta(true);
  }, [opened.size]);

  if (!isActive) return null;

  return (
    <SceneShell theme="light" id="scene-moments">
      <span className="mb-eyebrow">Moments Together</span>
      <h1 className="mb-title" style={{ fontSize: 'clamp(26px,5vw,40px)' }}>
        Floating Memories
      </h1>
      <p className="mb-sub">Tap a photo to hold it closer.</p>

      <div className="mb-moments">
        {MOMENT_POSITIONS.map((pos, i) => (
          <button
            key={MOMENT_CAPTIONS[i]}
            type="button"
            className="mb-moment"
            style={{
              top: pos.top,
              left: pos.left,
              transform: `rotate(${pos.rotate}deg)`,
              animationDelay: `${i * 0.4}s`,
              zIndex: opened.has(i) ? 2 : 1,
            }}
            onClick={() => {
              setActive(i);
              setOpened((prev) => new Set(prev).add(i));
            }}
            aria-label={`Open moment: ${MOMENT_CAPTIONS[i]}`}
          >
            <PhotoFace photoUrl={photos[i]} slotIndex={i as PhotoSlotIndex} />
          </button>
        ))}
      </div>

      <CTAButton show={showCta} onClick={onNext}>
        Open My Letter ❤️
      </CTAButton>

      <div
        className={`mb-modal ${active !== null ? 'show' : ''}`}
        role="dialog"
        aria-modal="true"
        onClick={() => setActive(null)}
      >
        <div className="mb-moment-modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="mb-moment-photo">
            <PhotoFace photoUrl={photos[active ?? 0]} slotIndex={(active ?? 0) as PhotoSlotIndex} />
          </div>
          <p className="mb-moment-caption">{active !== null ? MOMENT_CAPTIONS[active] : ''}</p>
          <button type="button" className="mb-modal-close" onClick={() => setActive(null)}>
            Close
          </button>
        </div>
      </div>
    </SceneShell>
  );
});
