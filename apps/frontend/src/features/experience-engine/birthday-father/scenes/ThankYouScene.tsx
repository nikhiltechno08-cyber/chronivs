'use client';

import { memo, useEffect, useState } from 'react';

import { CTAButton } from '../components/CTAButton';
import { SceneShell } from '../components/SceneShell';
import type { SceneComponentProps } from '../types';

export const ThankYouScene = memo(function ThankYouScene({ onNext, isActive }: SceneComponentProps) {
  const [showCta, setShowCta] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setShowCta(false);
      return;
    }
    const t = window.setTimeout(() => setShowCta(true), 1200);
    return () => clearTimeout(t);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <SceneShell theme="light" id="scene-father-thank-you">
      <span className="fb-chapter">Chapter Eleven — Thank You</span>
      <h1 className="fb-title fb-title-light" style={{ fontSize: 'clamp(22px,4.4vw,38px)' }}>
        Thank you for <em>everything</em>
        <br />
        you never had to do —
        <br />
        but did anyway.
      </h1>
      <CTAButton show={showCta} onClick={onNext} className="fb-cta-light">
        Open the Gift
      </CTAButton>
    </SceneShell>
  );
});
