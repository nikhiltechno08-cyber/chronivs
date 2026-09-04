'use client';

import { memo, useEffect } from 'react';

import { CelebrationFx } from '../components/CelebrationFx';
import { CTAButton } from '../components/CTAButton';
import { SceneShell } from '../components/SceneShell';
import type { SceneComponentProps } from '../types';

export const CelebrationScene = memo(function CelebrationScene({ onNext, isActive }: SceneComponentProps) {
  useEffect(() => {
    if (!isActive) return;
  }, [isActive]);

  if (!isActive) return null;

  return (
    <SceneShell id="scene-wife-celebration">
      <CelebrationFx active={isActive} />
      <div className="aw-eyebrow">OUR CELEBRATION</div>
      <div className="aw-hbday2">Happy Anniversary ❤️</div>
      <p className="aw-sub">Every beautiful year has been worth celebrating.</p>
      <CTAButton show onClick={onNext} small>
        One Last Surprise
      </CTAButton>
    </SceneShell>
  );
});
