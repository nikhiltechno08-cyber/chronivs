'use client';

import { memo, useEffect, useMemo, useState } from 'react';

import { CTAButton } from '../components/CTAButton';
import { SceneShell } from '../components/SceneShell';
import { HANDS_TEXT } from '../constants/story';
import type { SceneComponentProps } from '../types';

export const HandsScene = memo(function HandsScene({ onNext, isActive }: SceneComponentProps) {
  const [showWords, setShowWords] = useState(false);
  const [showCta, setShowCta] = useState(false);
  const words = useMemo(() => HANDS_TEXT.split(' '), []);

  useEffect(() => {
    if (!isActive) {
      setShowWords(false);
      setShowCta(false);
      return;
    }
    const t1 = window.setTimeout(() => setShowWords(true), 400);
    const t2 = window.setTimeout(() => setShowCta(true), 500 + words.length * 90 + 900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isActive, words.length]);

  if (!isActive) return null;

  return (
    <SceneShell theme="light" id="scene-father-hands">
      <span className="fb-chapter">Chapter Four — The Hands</span>
      <div className="fb-hands-wrap" aria-hidden="true">
        <svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M40,120 Q30,80 45,55 Q50,40 60,45 Q62,30 72,32 Q74,20 84,24 Q90,14 98,20 Q108,10 112,24 Q125,20 122,40 Q135,45 128,62 Q140,75 120,90 Q125,110 100,118 Q80,128 40,120 Z"
            fill="none"
            stroke="#6B4A32"
            strokeWidth="2.2"
            opacity="0.75"
          />
          <path
            d="M100,120 Q95,90 108,70 Q112,55 122,60 Q126,45 136,50 Q140,36 150,42 Q158,32 164,42 Q174,40 170,58 Q182,64 174,80 Q186,92 166,104 Q168,122 144,126 Q122,134 100,120 Z"
            fill="none"
            stroke="#B9793C"
            strokeWidth="2.2"
            opacity="0.6"
          />
        </svg>
      </div>
      <p className="fb-hands-text" aria-live="polite">
        {showWords &&
          words.map((word, i) => (
            <span key={`${word}-${i}`} className="fb-hands-word" style={{ animationDelay: `${0.4 + i * 0.09}s` }}>
              {word}&nbsp;
            </span>
          ))}
      </p>
      <CTAButton show={showCta} onClick={onNext} className="fb-cta-light">
        One More Step
      </CTAButton>
    </SceneShell>
  );
});
