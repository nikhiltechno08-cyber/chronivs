'use client';

import { memo } from 'react';

import { HoldButton } from '../components/HoldButton';
import { SceneShell } from '../components/SceneShell';
import type { SceneComponentProps } from '../types';

export const SealScene = memo(function SealScene({ onNext, isActive }: SceneComponentProps) {
  if (!isActive) return null;

  return (
    <SceneShell id="scene-prop-seal">
      <p className="prop-eyebrow prop-reveal">One More Secret</p>
      <div className="prop-seal-wrap">
        <div className="prop-envelope">
          <div className="prop-seal">✦</div>
        </div>
        <HoldButton label="Hold to Open" onComplete={onNext} />
      </div>
    </SceneShell>
  );
});
