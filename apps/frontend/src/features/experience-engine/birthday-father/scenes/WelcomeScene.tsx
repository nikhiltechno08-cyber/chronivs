'use client';

import { memo, useEffect, useState } from 'react';

import { CTAButton } from '../components/CTAButton';
import { SceneShell } from '../components/SceneShell';
import type { SceneComponentProps } from '../types';

/**
 * Prologue lines → Chapter One (HTML + user screenshots):
 * "My First Hero" → "Will Always Be You" → Happy Birthday Papa
 */
export const WelcomeScene = memo(function WelcomeScene({ data, onNext, isActive }: SceneComponentProps) {
  const [phase, setPhase] = useState<'hero' | 'always' | 'main'>('hero');
  const [showCta, setShowCta] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setPhase('hero');
      setShowCta(false);
      return;
    }

    const t1 = window.setTimeout(() => setPhase('always'), 2200);
    const t2 = window.setTimeout(() => setPhase('main'), 4400);
    const t3 = window.setTimeout(() => setShowCta(true), 5200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isActive]);

  if (!isActive) return null;

  const fatherName = data.receiverName || 'Papa';

  return (
    <SceneShell theme="light" id="scene-father-welcome">
      {phase !== 'main' ? (
        <div className="fb-prologue">
          <p className={`fb-prologue-line ${phase === 'hero' ? 'show' : 'leave'}`}>My First Hero</p>
          <p className={`fb-prologue-line ${phase === 'always' ? 'show' : phase === 'hero' ? '' : 'leave'}`}>
            Will Always Be You
          </p>
        </div>
      ) : (
        <div className="fb-welcome-main show">
          <span className="fb-chapter">Chapter One — The First Hero</span>
          <h1 className="fb-title fb-title-light">
            Happy Birthday,
            <br />
            {fatherName} <span aria-hidden="true">❤️</span>
          </h1>
          <p className="fb-sub fb-sub-light">
            Before I knew the word for it, I knew your hands, your voice, your shadow over mine — the
            very first shape of safety.
          </p>
          <CTAButton show={showCta} onClick={onNext} className="fb-cta-light">
            Walk Beside Me
          </CTAButton>
        </div>
      )}
    </SceneShell>
  );
});
