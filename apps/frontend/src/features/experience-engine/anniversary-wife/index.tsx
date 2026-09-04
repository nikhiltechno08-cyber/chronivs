'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { lazy, memo, Suspense, useCallback, useEffect, useState, type ComponentType } from 'react';

import { useReducedMotion } from '@/animations/hooks/use-reduced-motion';

import { useSceneManager } from '../core/useSceneManager';
import { CinematicEnding, useEndingActions } from '../shared/cinematic-ending';
import { sceneIn, sceneOut } from './animations/variants';
import { AmbientWorld } from './components/AmbientWorld';
import { HeartCursor } from './components/HeartCursor';
import { ParticleCanvas } from './components/ParticleCanvas';
import { SceneProgress } from './components/SceneProgress';
import { SoundToggle } from './components/SoundToggle';
import { getTemplateAmbientMusic } from '../config/ambient-music';
import { nextActiveScene } from '../core/scene-availability';
import { ACTIVE_SCENES, SCENE_COUNT, getWorldPhase } from './constants/story';
import { wifeFontVariables } from './fonts';
import { WelcomeScene } from './scenes/WelcomeScene';
import type { AnniversaryWifeProps, SceneComponentProps } from './types';
import './anniversary-experience.css';

/** Eager first scene for instant paint; remaining scenes code-split */
const PhotoScene = lazy(() =>
  import('./scenes/PhotoScene').then((m) => ({ default: m.PhotoScene })),
);
const RibbonScene = lazy(() =>
  import('./scenes/RibbonScene').then((m) => ({ default: m.RibbonScene })),
);
const ConstellationScene = lazy(() =>
  import('./scenes/ConstellationScene').then((m) => ({ default: m.ConstellationScene })),
);
const PuzzleScene = lazy(() =>
  import('./scenes/PuzzleScene').then((m) => ({ default: m.PuzzleScene })),
);
const FramesScene = lazy(() =>
  import('./scenes/FramesScene').then((m) => ({ default: m.FramesScene })),
);
const LetterScene = lazy(() =>
  import('./scenes/LetterScene').then((m) => ({ default: m.LetterScene })),
);
const VinylScene = lazy(() =>
  import('./scenes/VinylScene').then((m) => ({ default: m.VinylScene })),
);
const PromisesScene = lazy(() =>
  import('./scenes/PromisesScene').then((m) => ({ default: m.PromisesScene })),
);
const TreeScene = lazy(() =>
  import('./scenes/TreeScene').then((m) => ({ default: m.TreeScene })),
);
const CelebrationScene = lazy(() =>
  import('./scenes/CelebrationScene').then((m) => ({ default: m.CelebrationScene })),
);
const EndingScene = lazy(() =>
  import('./scenes/EndingScene').then((m) => ({ default: m.EndingScene })),
);

const SCENE_PREFETCHERS = [
  () => import('./scenes/PhotoScene'),
  () => import('./scenes/RibbonScene'),
  () => import('./scenes/ConstellationScene'),
  () => import('./scenes/PuzzleScene'),
  () => import('./scenes/FramesScene'),
  () => import('./scenes/LetterScene'),
  () => import('./scenes/VinylScene'),
  () => import('./scenes/PromisesScene'),
  () => import('./scenes/TreeScene'),
  () => import('./scenes/CelebrationScene'),
  () => import('./scenes/EndingScene'),
] as const;

type EndingProps = SceneComponentProps & {
  onExperienceEnd: () => void;
};

export const AnniversaryWifeExperience = memo(function AnniversaryWifeExperience({
  data,
  templateId,
  mode = 'preview',
  onComplete,
}: AnniversaryWifeProps) {
  const prefersReducedMotion = useReducedMotion();
  const { currentScene, goToScene, resetScenes, worldPhase } = useSceneManager(SCENE_COUNT, getWorldPhase);
  const [resetKey, setResetKey] = useState(0);
  const [endingVisible, setEndingVisible] = useState(false);
  const { goHome, openCheckout, isValidating, validationErrors, validationMessage } =
    useEndingActions(templateId);

  const handleNext = useCallback(() => {
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
  }, [resetScenes]);

  // Warm the next scene chunks during idle time so advances stay snappy
  useEffect(() => {
    const warm = (from: number) => {
      for (let i = from; i < Math.min(from + 2, SCENE_PREFETCHERS.length); i++) {
        void SCENE_PREFETCHERS[i]?.();
      }
    };
    warm(Math.max(0, currentScene));

    let idleId: number | undefined;
    let timeoutId: number | undefined;
    const run = () => warm(currentScene + 1);

    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(run, { timeout: 1200 });
    } else {
      timeoutId = window.setTimeout(run, 400);
    }

    return () => {
      if (idleId != null && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId != null) clearTimeout(timeoutId);
    };
  }, [currentScene]);

  const sceneProps: SceneComponentProps = {
    data,
    onNext: handleNext,
    isActive: true,
  };

  const renderScene = () => {
    switch (currentScene) {
      case 0:
        return <WelcomeScene {...sceneProps} />;
      case 1:
        return <PhotoScene {...sceneProps} />;
      case 2:
        return <RibbonScene {...sceneProps} />;
      case 3:
        return <ConstellationScene {...sceneProps} />;
      case 4:
        return <PuzzleScene {...sceneProps} />;
      case 5:
        return <FramesScene {...sceneProps} />;
      case 6:
        return <LetterScene {...sceneProps} />;
      case 7:
        return <VinylScene {...sceneProps} />;
      case 8:
        return <PromisesScene {...sceneProps} />;
      case 9:
        return <TreeScene {...sceneProps} />;
      case 10:
        return <CelebrationScene {...sceneProps} />;
      case 11: {
        const Ending = EndingScene as ComponentType<EndingProps>;
        return <Ending {...sceneProps} onExperienceEnd={handleExperienceEnd} />;
      }
      default:
        return null;
    }
  };

  return (
    <div className={`anniversary-experience ${wifeFontVariables}`}>
      <div className={`aw-stage${endingVisible ? ' cine-ending-host--active' : ''}`} key={resetKey}>
        <AmbientWorld sceneIndex={worldPhase} />
        <ParticleCanvas sceneIndex={worldPhase} />
        <SoundToggle src={getTemplateAmbientMusic('anniversary-wife')} />
        <SceneProgress currentScene={currentScene} />
        <HeartCursor />

        <div className="aw-scenes">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`scene-${currentScene}-${resetKey}`}
              className="aw-scene-motion"
              initial={prefersReducedMotion ? false : sceneIn.initial}
              animate={prefersReducedMotion ? undefined : sceneIn.animate}
              exit={prefersReducedMotion ? undefined : sceneOut.exit}
              style={{ pointerEvents: 'auto' }}
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
