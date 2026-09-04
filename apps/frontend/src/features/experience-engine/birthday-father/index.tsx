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
import { ACTIVE_SCENES, SCENE_COUNT, getWorldPhase, isLightChrome } from './constants/story';
import { fatherFontVariables } from './fonts';
import { WelcomeScene } from './scenes/WelcomeScene';
import type { BirthdayFatherProps } from './types';
import './father-experience.css';

/** Eager first scene; remaining scenes code-split */
const DoorScene = lazy(() =>
  import('./scenes/DoorScene').then((m) => ({ default: m.DoorScene })),
);
const TimelineScene = lazy(() =>
  import('./scenes/TimelineScene').then((m) => ({ default: m.TimelineScene })),
);
const HandsScene = lazy(() =>
  import('./scenes/HandsScene').then((m) => ({ default: m.HandsScene })),
);
const AlbumScene = lazy(() =>
  import('./scenes/AlbumScene').then((m) => ({ default: m.AlbumScene })),
);
const LanternsScene = lazy(() =>
  import('./scenes/LanternsScene').then((m) => ({ default: m.LanternsScene })),
);
const VoiceScene = lazy(() =>
  import('./scenes/VoiceScene').then((m) => ({ default: m.VoiceScene })),
);
const LetterScene = lazy(() =>
  import('./scenes/LetterScene').then((m) => ({ default: m.LetterScene })),
);
const CelebrationScene = lazy(() =>
  import('./scenes/CelebrationScene').then((m) => ({ default: m.CelebrationScene })),
);
const WishesScene = lazy(() =>
  import('./scenes/WishesScene').then((m) => ({ default: m.WishesScene })),
);
const ThankYouScene = lazy(() =>
  import('./scenes/ThankYouScene').then((m) => ({ default: m.ThankYouScene })),
);
const EndingScene = lazy(() =>
  import('./scenes/EndingScene').then((m) => ({ default: m.EndingScene })),
);

export const BirthdayFatherExperience = memo(function BirthdayFatherExperience({
  data,
  templateId,
  mode = 'preview',
  onComplete,
}: BirthdayFatherProps) {
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
      () => import('./scenes/DoorScene'),
      () => import('./scenes/TimelineScene'),
      () => import('./scenes/HandsScene'),
      () => import('./scenes/AlbumScene'),
      () => import('./scenes/LanternsScene'),
      () => import('./scenes/VoiceScene'),
      () => import('./scenes/LetterScene'),
      () => import('./scenes/CelebrationScene'),
      () => import('./scenes/WishesScene'),
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
        return <DoorScene {...sceneProps} />;
      case 2:
        return <TimelineScene {...sceneProps} />;
      case 3:
        return <HandsScene {...sceneProps} />;
      case 4:
        return <AlbumScene {...sceneProps} />;
      case 5:
        return <LanternsScene {...sceneProps} />;
      case 6:
        return <VoiceScene {...sceneProps} />;
      case 7:
        return <LetterScene {...sceneProps} />;
      case 8:
        return <CelebrationScene {...sceneProps} />;
      case 9:
        return <WishesScene {...sceneProps} />;
      case 10:
        return <ThankYouScene {...sceneProps} />;
      case 11:
        return <EndingScene {...sceneProps} onExperienceEnd={handleExperienceEnd} />;
      default:
        return null;
    }
  };

  const lightChrome = isLightChrome(worldPhase);

  return (
    <div className={`father-experience ${fatherFontVariables}`}>
      <div
        className={`fb-app ${lightChrome ? 'fb-chrome-light' : ''}${endingVisible ? ' cine-ending-host--active' : ''}`}
        key={resetKey}
      >
        <AmbientWorld worldPhase={worldPhase} />
        <TransitionSweep trigger={transitionKey} />
        <SoundToggle />
        <SceneProgress currentScene={currentScene} />

        <div className="fb-scene-stack">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`scene-${currentScene}`}
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
