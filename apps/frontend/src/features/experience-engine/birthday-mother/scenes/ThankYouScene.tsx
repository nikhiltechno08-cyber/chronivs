'use client';

import { memo, useEffect, useState } from 'react';

import { CTAButton } from '../components/CTAButton';
import { SceneShell } from '../components/SceneShell';
import { THANK_YOU_LINES } from '../constants/story';
import type { SceneComponentProps } from '../types';

export const ThankYouScene = memo(function ThankYouScene({ onNext, isActive }: SceneComponentProps) {
  const [visible, setVisible] = useState<boolean[]>([false, false, false]);
  const [glow, setGlow] = useState(false);
  const [showCta, setShowCta] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setVisible([false, false, false]);
      setGlow(false);
      setShowCta(false);
      return;
    }
    setGlow(true);
    const timers = [
      window.setTimeout(() => setVisible([true, false, false]), 400),
      window.setTimeout(() => setVisible([true, true, false]), 1600),
      window.setTimeout(() => setVisible([true, true, true]), 2800),
      window.setTimeout(() => setShowCta(true), 3600),
    ];
    return () => timers.forEach(clearTimeout);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <SceneShell theme="dark" id="scene-thank-you">
      <div className={`mb-thank-glow ${glow ? 'on' : ''}`} aria-hidden="true" />
      <span className="mb-eyebrow">Thank You Maa</span>
      <div className="mb-thank-lines">
        {THANK_YOU_LINES.map((line, i) => (
          <p key={line} className={`mb-thank-line ${visible[i] ? 'show' : ''}`}>
            {line}
          </p>
        ))}
      </div>
      <CTAButton show={showCta} onClick={onNext}>
        One Last Gift ✨
      </CTAButton>
    </SceneShell>
  );
});
