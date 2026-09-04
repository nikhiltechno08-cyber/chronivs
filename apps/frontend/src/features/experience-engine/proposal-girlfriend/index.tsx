'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { lazy, memo, Suspense, useCallback, useEffect, useRef, useState } from 'react';

import { useReducedMotion } from '@/animations/hooks/use-reduced-motion';

import { useSceneManager } from '../core/useSceneManager';
import { CinematicEnding, useEndingActions } from '../shared/cinematic-ending';
import { sceneIn, sceneOut, bridgeHandoffEnter, bridgeHandoffExit } from './animations/variants';
import { AmbientWorld } from './components/AmbientWorld';
import { CelebrationBurst } from './components/CelebrationBurst';
import { HeartCursor } from './components/HeartCursor';
import { ParticleCanvas } from './components/ParticleCanvas';
import { PetalLayer } from './components/PetalLayer';
import { ProgressBar } from './components/ProgressBar';
import { SoundToggle } from '../components/SoundToggle';
import { getTemplateAmbientMusic } from '../config/ambient-music';
import { SCENE_COUNT } from './constants/story';
import { propFontVariables } from './fonts';
import { LanternScene } from './scenes/LanternScene';
import type { ProposalGirlfriendProps, SceneComponentProps } from './types';
import './proposal-experience.css';

const PhotoScene = lazy(() => import('./scenes/PhotoScene').then((m) => ({ default: m.PhotoScene })));
const LittleThingsScene = lazy(() =>
  import('./scenes/LittleThingsScene').then((m) => ({ default: m.LittleThingsScene })),
);
const CardsScene = lazy(() => import('./scenes/CardsScene').then((m) => ({ default: m.CardsScene })));
const TimelineScene = lazy(() =>
  import('./scenes/TimelineScene').then((m) => ({ default: m.TimelineScene })),
);
const OrbsScene = lazy(() => import('./scenes/OrbsScene').then((m) => ({ default: m.OrbsScene })));
const SealScene = lazy(() => import('./scenes/SealScene').then((m) => ({ default: m.SealScene })));
const OneMoreSecretScene = lazy(() =>
  import('./scenes/OneMoreSecretScene').then((m) => ({ default: m.OneMoreSecretScene })),
);
const LetterScene = lazy(() => import('./scenes/LetterScene').then((m) => ({ default: m.LetterScene })));
const BeforeQuestionScene = lazy(() =>
  import('./scenes/BeforeQuestionScene').then((m) => ({ default: m.BeforeQuestionScene })),
);
const OneLastSurpriseScene = lazy(() =>
  import('./scenes/OneLastSurpriseScene').then((m) => ({ default: m.OneLastSurpriseScene })),
);
const ProposalScene = lazy(() =>
  import('./scenes/ProposalScene').then((m) => ({ default: m.ProposalScene })),
);
const CelebrationScene = lazy(() =>
  import('./scenes/CelebrationScene').then((m) => ({ default: m.CelebrationScene })),
);
const HopeScene = lazy(() => import('./scenes/HopeScene').then((m) => ({ default: m.HopeScene })));

const SCENE_PREFETCHERS = [
  () => import('./scenes/PhotoScene'),
  () => import('./scenes/LittleThingsScene'),
  () => import('./scenes/CardsScene'),
  () => import('./scenes/TimelineScene'),
  () => import('./scenes/OrbsScene'),
  () => import('./scenes/SealScene'),
  () => import('./scenes/OneMoreSecretScene'),
  () => import('./scenes/LetterScene'),
  () => import('./scenes/BeforeQuestionScene'),
  () => import('./scenes/OneLastSurpriseScene'),
  () => import('./scenes/ProposalScene'),
  () => import('./scenes/CelebrationScene'),
  () => import('./scenes/HopeScene'),
] as const;

const LETTER_SCENE_INDEX = 8;
const BEFORE_QUESTION_SCENE_INDEX = 9;
const ONE_LAST_SURPRISE_SCENE_INDEX = 10;
const PROPOSAL_SCENE_INDEX = 11;

export const ProposalGirlfriendExperience = memo(function ProposalGirlfriendExperience({
  data,
  templateId,
  mode = 'preview',
  onComplete,
}: ProposalGirlfriendProps) {
  const prefersReducedMotion = useReducedMotion();
  const { currentScene, nextScene, resetScenes } = useSceneManager(SCENE_COUNT);
  const [resetKey, setResetKey] = useState(0);
  const [endingVisible, setEndingVisible] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [zoomIn, setZoomIn] = useState(false);
  const [bridgeHandoff, setBridgeHandoff] = useState(false);
  const [letterHandoff, setLetterHandoff] = useState(false);
  const [ringHandoff, setRingHandoff] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const { goHome, openCheckout, isValidating, validationErrors, validationMessage } =
    useEndingActions(templateId);

  const handleNext = useCallback(() => {
    nextScene();
  }, [nextScene]);

  const handleLetterTransitionStart = useCallback(() => {
    setLetterHandoff(true);
  }, []);

  const handleRingTransitionStart = useCallback(() => {
    setRingHandoff(true);
    setBridgeHandoff(true);
  }, []);

  const handleBridgeTransitionStart = useCallback(() => {
    setBridgeHandoff(true);
  }, []);

  const handleProposalEnter = useCallback(() => {
    setDarkMode(true);
    setZoomIn(true);
  }, []);

  const handleProposalAnswer = useCallback(() => {
    setZoomIn(false);
  }, []);

  const handleExperienceEnd = useCallback(() => {
    setEndingVisible(true);
    onComplete?.();
  }, [onComplete]);

  const handleRestart = useCallback(() => {
    setEndingVisible(false);
    resetScenes();
    setDarkMode(false);
    setZoomIn(false);
    setBridgeHandoff(false);
    setLetterHandoff(false);
    setRingHandoff(false);
    setResetKey((k) => k + 1);
  }, [resetScenes]);

  useEffect(() => {
    if (currentScene >= PROPOSAL_SCENE_INDEX) {
      setDarkMode(true);
    }
  }, [currentScene]);

  useEffect(() => {
    if (currentScene === LETTER_SCENE_INDEX && letterHandoff) {
      const t = window.setTimeout(() => setLetterHandoff(false), 2600);
      return () => clearTimeout(t);
    }
  }, [currentScene, letterHandoff]);

  useEffect(() => {
    if (currentScene === PROPOSAL_SCENE_INDEX && (bridgeHandoff || ringHandoff)) {
      const t = window.setTimeout(() => {
        setBridgeHandoff(false);
        setRingHandoff(false);
      }, 2800);
      return () => clearTimeout(t);
    }
  }, [bridgeHandoff, currentScene, ringHandoff]);

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
        return <LanternScene {...sceneProps} />;
      case 1:
        return <PhotoScene {...sceneProps} />;
      case 2:
        return <LittleThingsScene {...sceneProps} />;
      case 3:
        return <CardsScene {...sceneProps} />;
      case 4:
        return <TimelineScene {...sceneProps} />;
      case 5:
        return <OrbsScene {...sceneProps} />;
      case 6:
        return <SealScene {...sceneProps} />;
      case 7:
        return (
          <OneMoreSecretScene
            {...sceneProps}
            onTransitionStart={handleLetterTransitionStart}
          />
        );
      case 8:
        return <LetterScene {...sceneProps} />;
      case 9:
        return (
          <BeforeQuestionScene
            {...sceneProps}
            onTransitionStart={handleBridgeTransitionStart}
          />
        );
      case 10:
        return (
          <OneLastSurpriseScene
            {...sceneProps}
            onTransitionStart={handleRingTransitionStart}
          />
        );
      case 11:
        return (
          <ProposalScene
            {...sceneProps}
            onEnter={handleProposalEnter}
            onAnswer={handleProposalAnswer}
          />
        );
      case 12:
        return <CelebrationScene {...sceneProps} />;
      case 13:
        return <HopeScene {...sceneProps} onExperienceEnd={handleExperienceEnd} />;
      default:
        return null;
    }
  };

  const isBridgeAmbient =
    currentScene === BEFORE_QUESTION_SCENE_INDEX || (bridgeHandoff && currentScene <= PROPOSAL_SCENE_INDEX);

  const isLetterOpening =
    letterHandoff && currentScene <= LETTER_SCENE_INDEX;

  const isRingOpening =
    ringHandoff && currentScene >= ONE_LAST_SURPRISE_SCENE_INDEX && currentScene <= PROPOSAL_SCENE_INDEX;

  const useSoftEnter =
    ((bridgeHandoff || ringHandoff) && currentScene === PROPOSAL_SCENE_INDEX) ||
    (letterHandoff && currentScene === LETTER_SCENE_INDEX);

  const useSoftExit = bridgeHandoff || letterHandoff || ringHandoff;

  return (
    <div className={`proposal-experience ${propFontVariables}`}>
      <div
        ref={stageRef}
        className={`prop-stage${darkMode ? ' dark-mode' : ''}${zoomIn ? ' zoom-in' : ''}${isBridgeAmbient ? ' bridge-quiet bridge-moon-zoom' : ''}${bridgeHandoff ? ' bridge-handoff' : ''}${isLetterOpening ? ' oms-opening' : ''}${isRingOpening ? ' ols-opening' : ''}${endingVisible ? ' cine-ending-host--active' : ''}`}
        key={resetKey}
      >
        <AmbientWorld fastTwinkle={darkMode} />
        <ParticleCanvas quiet={isBridgeAmbient && !darkMode} />
        <PetalLayer quiet={isBridgeAmbient && !darkMode} />
        <SoundToggle src={getTemplateAmbientMusic('proposal-girlfriend')} />
        <ProgressBar currentScene={currentScene} />
        <HeartCursor />
        <CelebrationBurst active={currentScene === 12} containerRef={stageRef} />

        <div className="prop-scene-root">
          <AnimatePresence mode="sync" initial={false}>
            <motion.div
              key={`scene-${currentScene}-${resetKey}`}
              className="prop-scene-motion"
              initial={
                prefersReducedMotion
                  ? false
                  : useSoftEnter
                    ? bridgeHandoffEnter.initial
                    : sceneIn.initial
              }
              animate={
                prefersReducedMotion
                  ? undefined
                  : useSoftEnter
                    ? bridgeHandoffEnter.animate
                    : sceneIn.animate
              }
              exit={
                prefersReducedMotion
                  ? undefined
                  : useSoftExit
                    ? bridgeHandoffExit.exit
                    : sceneOut.exit
              }
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
