'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { AnimatedText } from '../components/AnimatedText';
import { CTAButton } from '../components/CTAButton';
import { CuteTeddy } from '../components/CuteTeddy';
import { LoveLetter } from '../components/LoveLetter';
import { PerfectHeart } from '../components/PerfectHeart';
import { SceneContainer } from '../components/SceneContainer';
import { buildLetterText } from '../constants/story';
import type { SceneComponentProps } from '../types';

const HOLD_MS = 2000;
const CIRC = 2 * Math.PI * 65;

export const HeartScene = memo(function HeartScene({ data, onNext, isActive }: SceneComponentProps) {
  const [headline, setHeadline] = useState('Can you feel it?');
  const [sub, setSub] = useState('Hold for 2 seconds ❤️');
  const [heartGone, setHeartGone] = useState(false);
  const [letterOpen, setLetterOpen] = useState(false);
  const [letterReady, setLetterReady] = useState(false);
  const [showBear, setShowBear] = useState(false);
  const [showCta, setShowCta] = useState(false);
  const [heartOpened, setHeartOpened] = useState(false);
  const holdRaf = useRef<number | null>(null);
  const holdStart = useRef<number | null>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const letterText = buildLetterText(data.customMessage);

  const completeHold = useCallback(() => {
    if (heartOpened) return;
    setHeartOpened(true);
    setHeadline('I feel it too.');
    setSub('A letter, just for you…');

    window.setTimeout(() => setHeartGone(true), 650);
    window.setTimeout(() => {
      setLetterOpen(true);
      window.setTimeout(() => setLetterReady(true), 450);
    }, 1150);
  }, [heartOpened]);

  const startHold = useCallback(() => {
    if (heartOpened) return;
    holdStart.current = performance.now();
    wrapRef.current?.classList.add('pulsing');

    const step = (now: number) => {
      if (!holdStart.current) return;
      const elapsed = now - holdStart.current;
      const pct = Math.min(1, elapsed / HOLD_MS);
      if (ringRef.current) {
        ringRef.current.style.strokeDashoffset = String(CIRC * (1 - pct));
      }
      if (pct >= 1) {
        completeHold();
        return;
      }
      holdRaf.current = requestAnimationFrame(step);
    };
    holdRaf.current = requestAnimationFrame(step);
  }, [completeHold, heartOpened]);

  const cancelHold = useCallback(() => {
    if (heartOpened) return;
    if (holdRaf.current) cancelAnimationFrame(holdRaf.current);
    holdStart.current = null;
    wrapRef.current?.classList.remove('pulsing');
    if (ringRef.current) ringRef.current.style.strokeDashoffset = String(CIRC);
  }, [heartOpened]);

  useEffect(() => {
    if (!isActive) return;
    const fallback = window.setTimeout(() => {
      if (!heartOpened) setShowCta(true);
    }, 13000);
    return () => clearTimeout(fallback);
  }, [heartOpened, isActive]);

  const onLetterComplete = useCallback(() => {
    setShowBear(true);
    window.setTimeout(() => setShowCta(true), 400);
  }, []);

  if (!isActive) return null;

  return (
    <SceneContainer id="scene-heart">
      <div className="eyebrow">My Heart</div>
      <h1 className="serif" id="heartHeadline">
        {headline}
      </h1>
      <p className={`sub fade-collapse ${heartGone ? 'gone hidden-block' : ''}`} id="heartSub">
        {sub}
      </p>
      <div
        ref={wrapRef}
        className={`heart-hold-wrap fade-collapse ${heartGone ? 'gone hidden-block' : ''}`}
        id="heartHoldWrap"
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        role="button"
        aria-label="Hold to open your letter"
      >
        <svg className="hold-ring" viewBox="0 0 140 140" aria-hidden="true">
          <circle ref={ringRef} cx="70" cy="70" r="65" style={{ strokeDasharray: CIRC, strokeDashoffset: CIRC }} />
        </svg>
        <PerfectHeart className="heart-svg" />
      </div>
      <LoveLetter open={letterOpen} text={letterText} variant="card">
        <AnimatedText text={letterText} className="hand" play={letterReady} onComplete={onLetterComplete} />
      </LoveLetter>
      <div className={`bear-cameo ${showBear ? 'show' : ''}`} id="bearCameo1">
        <CuteTeddy withHeart />
      </div>
      <CTAButton show={showCta} onClick={onNext}>
        You&apos;re My Favorite Chapter
      </CTAButton>
    </SceneContainer>
  );
});
