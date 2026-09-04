'use client';

import { memo } from 'react';

import { SceneShell } from '../components/SceneShell';
import type { SceneComponentProps } from '../types';

export const CelebrationScene = memo(function CelebrationScene({ onNext, isActive }: SceneComponentProps) {
  if (!isActive) return null;

  return (
    <SceneShell id="scene-prop-celebration">
      <h1 className="prop-title prop-reveal">You said yes.</h1>
      <p className="prop-quote prop-reveal" style={{ animationDelay: '0.4s' }}>
        Best answer I&apos;ve ever heard.
      </p>
      <button
        type="button"
        className="prop-btn prop-reveal"
        style={{ animationDelay: '1s' }}
        onClick={onNext}
      >
        Continue
      </button>
    </SceneShell>
  );
});
