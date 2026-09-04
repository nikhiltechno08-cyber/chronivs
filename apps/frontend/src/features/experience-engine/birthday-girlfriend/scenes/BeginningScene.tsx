'use client';

import { memo, useEffect, useState } from 'react';

import { CTAButton } from '../components/CTAButton';
import { PhotoFrame } from '../components/PhotoFrame';
import { SceneContainer } from '../components/SceneContainer';
import type { SceneComponentProps } from '../types';

export const BeginningScene = memo(function BeginningScene({ data, onNext, isActive }: SceneComponentProps) {
  const [showCta, setShowCta] = useState(false);
  const [developed, setDeveloped] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setShowCta(false);
      setDeveloped(false);
      return;
    }
    const developTimer = window.setTimeout(() => setDeveloped(true), 400);
    const ctaTimer = window.setTimeout(() => setShowCta(true), 900);
    return () => {
      clearTimeout(developTimer);
      clearTimeout(ctaTimer);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <SceneContainer id="scene-beginning" className={developed ? 'active' : ''}>
      <div className="eyebrow">Where It All Began</div>
      <PhotoFrame
        photoUrl={data.photos[1]}
        slotIndex={1}
        variant="develop"
        developActive={developed}
      />
      <h1 className="serif">The day everything changed…</h1>
      <p className="sub">
        I didn&apos;t know then, that one day, you would become my whole world.
      </p>
      <CTAButton show={showCta} onClick={onNext}>
        Remember This Moment
      </CTAButton>
    </SceneContainer>
  );
});
