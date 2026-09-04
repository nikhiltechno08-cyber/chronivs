'use client';

import { memo } from 'react';

import { SCENE_COUNT } from '../constants/story';

type ProgressBarProps = {
  currentScene: number;
};

export const ProgressBar = memo(function ProgressBar({ currentScene }: ProgressBarProps) {
  const pct = SCENE_COUNT > 1 ? (currentScene / (SCENE_COUNT - 1)) * 100 : 0;

  return (
    <div
      className="prop-progress"
      style={{ width: `${pct}%` }}
      role="progressbar"
      aria-valuenow={currentScene + 1}
      aria-valuemin={1}
      aria-valuemax={SCENE_COUNT}
      aria-label="Experience progress"
    />
  );
});
