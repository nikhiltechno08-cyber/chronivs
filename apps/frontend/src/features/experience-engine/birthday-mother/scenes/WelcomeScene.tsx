'use client';

import { memo, useEffect, useState } from 'react';

import { CTAButton } from '../components/CTAButton';
import { SceneShell } from '../components/SceneShell';
import type { SceneComponentProps } from '../types';

export const WelcomeScene = memo(function WelcomeScene({ data, onNext, isActive }: SceneComponentProps) {
  const [line1, setLine1] = useState(false);
  const [line2, setLine2] = useState(false);
  const [main, setMain] = useState(false);
  const [showCta, setShowCta] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setLine1(false);
      setLine2(false);
      setMain(false);
      setShowCta(false);
      return;
    }
    const t1 = window.setTimeout(() => setLine1(true), 300);
    const t2 = window.setTimeout(() => setLine2(true), 1400);
    const t3 = window.setTimeout(() => {
      setLine1(false);
      setLine2(false);
      setMain(true);
    }, 3200);
    const t4 = window.setTimeout(() => setShowCta(true), 3900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isActive]);

  if (!isActive) return null;

  const motherName = data.receiverName || 'Maa';

  return (
    <SceneShell theme="dark" id="scene-welcome">
      <div style={{ position: 'relative', minHeight: main ? undefined : 120, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {!main && (
          <>
            <p className={`mb-open-line ${line1 ? 'show' : ''}`}>Every hero has a first home.</p>
            <p className={`mb-open-line ${line2 ? 'show' : ''}`} style={{ marginTop: 12 }}>
              Mine was you.
            </p>
          </>
        )}
        <div className={`mb-open-main ${main ? 'show' : ''}`}>
          <span className="mb-eyebrow">A Chronivs Experience</span>
          <h1 className="mb-title">
            Happy Birthday,
            <br />
            {motherName} ❤️
          </h1>
          <p className="mb-sub">Every heartbeat of mine began because of yours.</p>
          <CTAButton show={showCta} onClick={onNext}>
            Walk With Me Maa ❤️
          </CTAButton>
        </div>
      </div>
    </SceneShell>
  );
});
