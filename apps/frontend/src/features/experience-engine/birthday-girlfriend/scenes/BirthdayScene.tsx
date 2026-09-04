'use client';

import { memo, useEffect, useRef, useState } from 'react';

import { CTAButton } from '../components/CTAButton';
import { PhotoFrame } from '../components/PhotoFrame';
import { SceneContainer } from '../components/SceneContainer';
import type { SceneComponentProps } from '../types';

export const BirthdayScene = memo(function BirthdayScene({ data, onNext, isActive }: SceneComponentProps) {
  const [showCta, setShowCta] = useState(false);
  const polaroidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) {
      setShowCta(false);
      return;
    }
    const t = window.setTimeout(() => setShowCta(true), 900);
    return () => clearTimeout(t);
  }, [isActive]);

  useEffect(() => {
    if (!isActive || !window.matchMedia('(pointer:fine)').matches) return;
    const el = polaroidRef.current;
    if (!el) return;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.classList.add('held');
      el.style.transform = `rotate(${py * 10}deg) rotateY(${px * 14}deg)`;
    };
    const onLeave = () => {
      el.classList.remove('held');
      el.style.transform = '';
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <SceneContainer id="scene-birthday">
      <div className="eyebrow">Today, Of All Days</div>
      <div ref={polaroidRef}>
        <PhotoFrame photoUrl={data.photos[0]} slotIndex={0} variant="polaroid" />
      </div>
      <h1 className="serif">
        Happy Birthday,
        <br />
        <em>{data.receiverName || 'My Beautiful Girl'}</em>
      </h1>
      <p className="sub">
        Today isn&apos;t just another day. It&apos;s the day my favorite person came into this world.
      </p>
      <CTAButton show={showCta} onClick={onNext}>
        Turn The Next Page
      </CTAButton>
    </SceneContainer>
  );
});
