'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { lazy, memo, Suspense, useCallback, useEffect, useState } from 'react';

import { useReducedMotion } from '@/animations/hooks/use-reduced-motion';

import { useSceneManager } from '../core/useSceneManager';
import { CinematicEnding, useEndingActions } from '../shared/cinematic-ending';
import { FloatingBackground } from './components/FloatingBackground';
import { SceneProgress } from './components/SceneProgress';
import { SoundToggle } from './components/SoundToggle';
import { TransitionSweep } from './components/TransitionSweep';
import { pageTurnIn, pageTurnOut } from './animations/variants';
import { getTemplateAmbientMusic } from '../config/ambient-music';
import { SCENE_COUNT, getWorldPhase } from './constants/story';
import { birthdayFontVariables } from './fonts';
import { SurpriseScene } from './scenes/SurpriseScene';
import type { BirthdayGirlfriendProps } from './types';
import './birthday-experience.css';

/** Eager first scene; remaining scenes code-split */
const BirthdayScene = lazy(() =>
  import('./scenes/BirthdayScene').then((m) => ({ default: m.BirthdayScene })),
);
const BeginningScene = lazy(() =>
  import('./scenes/BeginningScene').then((m) => ({ default: m.BeginningScene })),
);
const MemoriesScene = lazy(() =>
  import('./scenes/MemoriesScene').then((m) => ({ default: m.MemoriesScene })),
);
const LoveScene = lazy(() =>
  import('./scenes/LoveScene').then((m) => ({ default: m.LoveScene })),
);
const HeartScene = lazy(() =>
  import('./scenes/HeartScene').then((m) => ({ default: m.HeartScene })),
);
const CelebrationScene = lazy(() =>
  import('./scenes/CelebrationScene').then((m) => ({ default: m.CelebrationScene })),
);
const ForeverScene = lazy(() =>
  import('./scenes/ForeverScene').then((m) => ({ default: m.ForeverScene })),
);

export const BirthdayGirlfriendExperience = memo(function BirthdayGirlfriendExperience({
  data,
  templateId,
  mode = 'preview',
  onComplete,
}: BirthdayGirlfriendProps) {
  const prefersReducedMotion = useReducedMotion();
  const { currentScene, nextScene, resetScenes, worldPhase } = useSceneManager(SCENE_COUNT, getWorldPhase);
  const [transitionKey, setTransitionKey] = useState(0);
  const [endingVisible, setEndingVisible] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const { goHome, openCheckout, isValidating, validationErrors, validationMessage } =
    useEndingActions(templateId);

  const handleNext = useCallback(() => {
    setTransitionKey((k) => k + 1);
    nextScene();
  }, [nextScene]);

  const handleExperienceEnd = useCallback(() => {
    setEndingVisible(true);
    onComplete?.();
  }, [onComplete]);

  const handleRestart = useCallback(() => {
    setEndingVisible(false);
    resetScenes();
    setResetKey((k) => k + 1);
    setTransitionKey(0);
  }, [resetScenes]);

  // Prefetch the next scene chunk while the current one plays.
  useEffect(() => {
    const prefetchers: Array<() => Promise<unknown>> = [
      () => import('./scenes/BirthdayScene'),
      () => import('./scenes/BeginningScene'),
      () => import('./scenes/MemoriesScene'),
      () => import('./scenes/LoveScene'),
      () => import('./scenes/HeartScene'),
      () => import('./scenes/CelebrationScene'),
      () => import('./scenes/ForeverScene'),
    ];
    const load = prefetchers[currentScene];
    if (load) void load();
  }, [currentScene]);

  const sceneProps = {
    data,
    onNext: handleNext,
    isActive: true,
  };

  const renderScene = () => {
    switch (currentScene) {
      case 0:
        return <SurpriseScene {...sceneProps} />;
      case 1:
        return <BirthdayScene {...sceneProps} />;
      case 2:
        return <BeginningScene {...sceneProps} />;
      case 3:
        return <MemoriesScene {...sceneProps} />;
      case 4:
        return <LoveScene {...sceneProps} />;
      case 5:
        return <HeartScene {...sceneProps} />;
      case 6:
        return <CelebrationScene {...sceneProps} />;
      case 7:
        return <ForeverScene {...sceneProps} onExperienceEnd={handleExperienceEnd} />;
      default:
        return null;
    }
  };

  return (
    <div className={`birthday-experience ${birthdayFontVariables}`} key={resetKey}>
      <div className={`exp-app${endingVisible ? ' cine-ending-host--active' : ''}`}>
        <FloatingBackground worldPhase={worldPhase} />
        <TransitionSweep trigger={transitionKey} />
        <SoundToggle src={getTemplateAmbientMusic('birthday-girlfriend')} />
        <SceneProgress currentScene={currentScene} />

        <div className="exp-scene-stack">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`scene-${currentScene}-${resetKey}`}
              style={{ position: 'absolute', inset: 0, zIndex: 10 }}
              initial={prefersReducedMotion || transitionKey === 0 ? false : pageTurnIn.initial}
              animate={prefersReducedMotion ? undefined : pageTurnIn.animate}
              exit={prefersReducedMotion ? undefined : pageTurnOut.exit}
            >
              <Suspense fallback={<div className="absolute inset-0 bg-[#090909]" aria-hidden="true" />}>
                {renderScene()}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>

        <CinematicEnding
          visible={endingVisible}
          mode={mode}
          templateId={templateId}
          onRestart={handleRestart}
          onCreateExperience={openCheckout}
          onHome={goHome}
          isValidating={isValidating}
          validationErrors={validationErrors}
          validationMessage={validationMessage}
        />
      </div>
    </div>
  );
});
