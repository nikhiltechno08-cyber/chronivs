'use client';

import { memo } from 'react';

import { SCENE_COUNT } from '../constants/story';

type SceneProgressProps = {
  currentScene: number;
};

export const SceneProgress = memo(function SceneProgress({ currentScene }: SceneProgressProps) {
  return (
    <div id="dots" aria-label={`Scene ${currentScene + 1} of ${SCENE_COUNT}`}>
      {Array.from({ length: SCENE_COUNT }, (_, i) => (
        <span key={i} className={i === currentScene ? 'active' : ''} aria-hidden="true" />
      ))}
    </div>
  );
});
