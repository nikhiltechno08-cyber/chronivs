'use client';

import { useCallback, useRef, useState } from 'react';

const TRANSITION_MS = 980;

export type SceneManagerState = {
  currentScene: number;
  direction: number;
  isTransitioning: boolean;
  worldPhase: number;
};

export type SceneManagerActions = {
  nextScene: () => void;
  previousScene: () => void;
  goToScene: (index: number) => void;
  resetScenes: () => void;
  onTransitionStart: () => void;
  onTransitionEnd: () => void;
};

export function useSceneManager(
  sceneCount: number,
  getWorldPhase?: (sceneIndex: number) => number,
): SceneManagerState & SceneManagerActions {
  const [currentScene, setCurrentScene] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const lockRef = useRef(false);

  const worldPhase = getWorldPhase?.(currentScene) ?? currentScene + 1;

  const goToScene = useCallback(
    (index: number) => {
      if (lockRef.current) return;
      if (index === currentScene || index < 0 || index >= sceneCount) return;

      lockRef.current = true;
      setDirection(index > currentScene ? 1 : -1);
      setIsTransitioning(true);
      setCurrentScene(index);

      window.setTimeout(() => {
        setIsTransitioning(false);
        lockRef.current = false;
      }, TRANSITION_MS);
    },
    [currentScene, sceneCount],
  );

  const nextScene = useCallback(() => goToScene(currentScene + 1), [currentScene, goToScene]);
  const previousScene = useCallback(() => goToScene(currentScene - 1), [currentScene, goToScene]);

  const resetScenes = useCallback(() => {
    lockRef.current = false;
    setCurrentScene(0);
    setDirection(1);
    setIsTransitioning(false);
  }, []);

  return {
    currentScene,
    direction,
    isTransitioning,
    worldPhase,
    nextScene,
    previousScene,
    goToScene,
    resetScenes,
    onTransitionStart: () => setIsTransitioning(true),
    onTransitionEnd: () => {
      setIsTransitioning(false);
      lockRef.current = false;
    },
  };
}

export { TRANSITION_MS };
