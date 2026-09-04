'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { lazy, memo, Suspense, useCallback, useEffect, useState } from 'react';

import { useReducedMotion } from '@/animations/hooks/use-reduced-motion';

import { useSceneManager } from '../core/useSceneManager';
import { CinematicEnding, useEndingActions } from '../shared/cinematic-ending';
import { AmbientWorld } from './components/AmbientWorld';
import { SceneProgress } from './components/SceneProgress';
import { SoundToggle } from './components/SoundToggle';
import { TransitionSweep } from './components/TransitionSweep';
import { pageTurnIn, pageTurnOut } from './animations/variants';
import { nextActiveScene } from '../core/scene-availability';
import { ACTIVE_SCENES, SCENE_COUNT, getWorldPhase } from './constants/story';
import { motherFontVariables } from './fonts';
import { WelcomeScene } from './scenes/WelcomeScene';
import type { BirthdayMotherProps } from './types';
import './mother-experience.css';

/** Eager first scene; remaining scenes code-split */
const MemoryGardenScene = lazy(() =>
  import('./scenes/MemoryGardenScene').then((m) => ({ default: m.MemoryGardenScene })),
);
const MomentsScene = lazy(() =>
  import('./scenes/MomentsScene').then((m) => ({ default: m.MomentsScene })),
);
const HeartLetterScene = lazy(() =>
  import('./scenes/HeartLetterScene').then((m) => ({ default: m.HeartLetterScene })),
);
const VoiceScene = lazy(() =>
  import('./scenes/VoiceScene').then((m) => ({ default: m.VoiceScene })),
);
const ThankYouScene = lazy(() =>
  import('./scenes/ThankYouScene').then((m) => ({ default: m.ThankYouScene })),
);
const EndingScene = lazy(() =>
  import('./scenes/EndingScene').then((m) => ({ default: m.EndingScene })),
);

export const BirthdayMotherExperience = memo(function BirthdayMotherExperience({
  data,
  templateId,
  mode = 'preview',
  onComplete,
}: BirthdayMotherProps) {
  const prefersReducedMotion = useReducedMotion();
  const { currentScene, goToScene, resetScenes, worldPhase } = useSceneManager(SCENE_COUNT, getWorldPhase);
  const [transitionKey, setTransitionKey] = useState(0);
  const [endingVisible, setEndingVisible] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const { goHome, openCheckout, isValidating, validationErrors, validationMessage } =
    useEndingActions(templateId);

  const handleNext = useCallback(() => {
    setTransitionKey((k) => k + 1);
    goToScene(nextActiveScene(ACTIVE_SCENES, currentScene));
  }, [currentScene, goToScene]);

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
      () => import('./scenes/MemoryGardenScene'),
      () => import('./scenes/MomentsScene'),
      () => import('./scenes/HeartLetterScene'),
      () => import('./scenes/VoiceScene'),
      () => import('./scenes/ThankYouScene'),
      () => import('./scenes/EndingScene'),
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
        return <WelcomeScene {...sceneProps} />;
      case 1:
        return <MemoryGardenScene {...sceneProps} />;
      case 2:
        return <MomentsScene {...sceneProps} />;
      case 3:
        return <HeartLetterScene {...sceneProps} />;
      case 4:
        return <VoiceScene {...sceneProps} />;
      case 5:
        return <ThankYouScene {...sceneProps} />;
      case 6:
        return <EndingScene {...sceneProps} onExperienceEnd={handleExperienceEnd} />;
      default:
        return null;
    }
  };

  return (
    <div className={`mother-experience ${motherFontVariables}`} key={resetKey}>
      <div className={`mb-app${endingVisible ? ' cine-ending-host--active' : ''}`}>
        <AmbientWorld worldPhase={worldPhase} />
        <TransitionSweep trigger={transitionKey} />
        <SoundToggle />
        <SceneProgress currentScene={currentScene} />

        <div className="mb-scene-stack">
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
