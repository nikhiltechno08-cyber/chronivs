'use client';

import { memo } from 'react';

import { activeScenePosition } from '../../core/scene-availability';
import { ACTIVE_SCENES } from '../constants/story';

type SceneProgressProps = {
  currentScene: number;
};

export const SceneProgress = memo(function SceneProgress({ currentScene }: SceneProgressProps) {
  const position = activeScenePosition(ACTIVE_SCENES, currentScene);

  return (
    <div className="fb-dots" aria-hidden="true">
      {ACTIVE_SCENES.map((sceneIndex, i) => (
        <span key={sceneIndex} className={i === position ? 'active' : ''} />
      ))}
    </div>
  );
});
