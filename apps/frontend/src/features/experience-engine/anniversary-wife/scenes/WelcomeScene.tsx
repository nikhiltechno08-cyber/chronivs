'use client';

import { memo } from 'react';

import { CTAButton } from '../components/CTAButton';
import { SceneShell } from '../components/SceneShell';
import type { SceneComponentProps } from '../types';

export const WelcomeScene = memo(function WelcomeScene({ data, onNext, isActive }: SceneComponentProps) {
  if (!isActive) return null;

  const herName = data.receiverName || 'my love';

  return (
    <SceneShell id="scene-wife-welcome">
      <div className="aw-eyebrow">OUR FOREVER BEGINS</div>
      <div className="aw-frame-wrap">
        <div className="aw-frame-inner">💞</div>
      </div>
      <h1 className="aw-title">
        Happy Anniversary <em>❤️</em>
      </h1>
      <p className="aw-sub">
        Every year with you, {herName}, has been the most beautiful chapter of my life.
      </p>
      <CTAButton show onClick={onNext} spawnHearts>
        Begin Our Journey
      </CTAButton>
    </SceneShell>
  );
});
