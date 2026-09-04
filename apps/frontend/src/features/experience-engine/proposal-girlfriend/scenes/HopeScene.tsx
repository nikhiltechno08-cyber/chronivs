'use client';

import { memo, useEffect, useRef } from 'react';

import { SceneShell } from '../components/SceneShell';
import type { SceneComponentProps } from '../types';

type HopeSceneProps = SceneComponentProps & {
  onExperienceEnd: () => void;
};

export const HopeScene = memo(function HopeScene({ isActive, onExperienceEnd }: HopeSceneProps) {
  const endedRef = useRef(false);

  useEffect(() => {
    if (!isActive) {
      endedRef.current = false;
      return;
    }
    if (endedRef.current) return;
    const timer = window.setTimeout(() => {
      endedRef.current = true;
      onExperienceEnd();
    }, 3200);
    return () => clearTimeout(timer);
  }, [isActive, onExperienceEnd]);

  if (!isActive) return null;

  return (
    <SceneShell id="scene-prop-hope">
      <p className="prop-eyebrow prop-reveal">And So It Begins</p>
      <h1 className="prop-title prop-reveal" style={{ animationDelay: '0.3s' }}>
        To forever,
        <br />
        and everything after.
      </h1>
      <p className="prop-line prop-reveal" style={{ animationDelay: '1s' }}>
        Every night from here is ours to write.
      </p>
    </SceneShell>
  );
});
