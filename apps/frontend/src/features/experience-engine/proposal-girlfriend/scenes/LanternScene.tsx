'use client';

import { memo } from 'react';

import { SceneShell } from '../components/SceneShell';
import type { SceneComponentProps } from '../types';

export const LanternScene = memo(function LanternScene({ onNext, isActive }: SceneComponentProps) {
  if (!isActive) return null;

  return (
    <SceneShell id="scene-prop-lantern">
      <div className="prop-lantern-wrap">
        <div className="prop-lantern" />
      </div>
      <p className="prop-eyebrow prop-reveal" style={{ animationDelay: '0.1s' }}>
        Tonight
      </p>
      <h1 className="prop-title prop-reveal" style={{ animationDelay: '0.5s' }}>
        I don&apos;t want to
        <br />
        tell you a story.
      </h1>
      <p className="prop-line prop-reveal" style={{ animationDelay: '1.4s' }}>
        I want to change ours.
      </p>
      <button
        type="button"
        className="prop-btn prop-reveal"
        style={{ animationDelay: '2.4s' }}
        onClick={onNext}
      >
        ✨ Walk With Me
      </button>
    </SceneShell>
  );
});
