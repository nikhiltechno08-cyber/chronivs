'use client';

import { memo, useEffect, useState } from 'react';

import { CTAButton } from '../components/CTAButton';
import { PhotoFace } from '../components/PhotoFace';
import { SceneShell } from '../components/SceneShell';
import { FLOWER_POSITIONS, GARDEN_QUOTES, resolveMotherPhotos } from '../constants/story';
import type { PhotoSlotIndex, SceneComponentProps } from '../types';

const FLOWER_FILLS = [
  { petal: '#e7b593', center: '#f0c98a' },
  { petal: '#e8c7a0', center: '#d9ad63' },
  { petal: '#f3d9ac', center: '#e0996b' },
  { petal: '#e9cc9c', center: '#caa06e' },
  { petal: '#f7d9a8', center: '#d9a463' },
] as const;

function FlowerSvg({ petal, center }: { petal: string; center: string }) {
  return (
    <svg viewBox="0 0 60 60" aria-hidden="true">
      <g fill={petal}>
        <circle cx="30" cy="16" r="10" />
        <circle cx="30" cy="44" r="10" />
        <circle cx="16" cy="30" r="10" />
        <circle cx="44" cy="30" r="10" />
      </g>
      <circle cx="30" cy="30" r="9" fill={center} />
    </svg>
  );
}

export const MemoryGardenScene = memo(function MemoryGardenScene({
  data,
  onNext,
  isActive,
}: SceneComponentProps) {
  const photos = resolveMotherPhotos(data.photos);
  const [opened, setOpened] = useState<Set<number>>(new Set());
  const [active, setActive] = useState<number | null>(null);
  const [showCta, setShowCta] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setOpened(new Set());
      setActive(null);
      setShowCta(false);
      return;
    }
    const t = window.setTimeout(() => setShowCta(true), 5000);
    return () => clearTimeout(t);
  }, [isActive]);

  useEffect(() => {
    if (opened.size >= 3) setShowCta(true);
  }, [opened.size]);

  if (!isActive) return null;

  const openFlower = (index: number) => {
    setActive(index);
    setOpened((prev) => new Set(prev).add(index));
  };

  return (
    <SceneShell theme="light" id="scene-memory-garden">
      <span className="mb-eyebrow">Memory Garden</span>
      <h1 className="mb-title" style={{ fontSize: 'clamp(26px,5vw,40px)' }}>
        Every Bloom, A Memory
      </h1>
      <p className="mb-sub">Tap a flower to open a memory.</p>

      <div className="mb-garden">
        <div className="mb-butterfly mb-bfly-1" aria-hidden="true">
          <svg viewBox="0 0 24 16" fill="#e0996b">
            <ellipse cx="7" cy="8" rx="6" ry="7" />
            <ellipse cx="17" cy="8" rx="6" ry="7" />
          </svg>
        </div>
        <div className="mb-butterfly mb-bfly-2" aria-hidden="true">
          <svg viewBox="0 0 24 16" fill="#caa06e">
            <ellipse cx="7" cy="8" rx="6" ry="7" />
            <ellipse cx="17" cy="8" rx="6" ry="7" />
          </svg>
        </div>
        {FLOWER_POSITIONS.map((pos, i) => (
          <button
            key={GARDEN_QUOTES[i]}
            type="button"
            className={`mb-flower ${opened.has(i) ? 'bloomed' : ''}`}
            style={{ top: pos.top, left: pos.left, animationDelay: `${i * 0.35}s` }}
            onClick={() => openFlower(i)}
            aria-label={`Open memory: ${GARDEN_QUOTES[i]}`}
          >
            <FlowerSvg petal={FLOWER_FILLS[i]!.petal} center={FLOWER_FILLS[i]!.center} />
          </button>
        ))}
      </div>

      <CTAButton show={showCta} onClick={onNext}>
        Moments Together
      </CTAButton>

      <div
        className={`mb-modal ${active !== null ? 'show' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Memory"
        onClick={() => setActive(null)}
      >
        <div className="mb-garden-card" onClick={(e) => e.stopPropagation()}>
          <div className="mb-photo-circle">
            <PhotoFace photoUrl={photos[active ?? 0]} slotIndex={(active ?? 0) as PhotoSlotIndex} />
          </div>
          <p>{active !== null ? GARDEN_QUOTES[active] : ''}</p>
          <button type="button" className="mb-modal-close" onClick={() => setActive(null)}>
            Close
          </button>
        </div>
      </div>
    </SceneShell>
  );
});
