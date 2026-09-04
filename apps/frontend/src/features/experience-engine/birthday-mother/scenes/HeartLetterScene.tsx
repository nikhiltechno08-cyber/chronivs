'use client';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { CTAButton } from '../components/CTAButton';
import { HandwritingText } from '../components/HandwritingText';
import { SceneShell } from '../components/SceneShell';
import { buildMotherLetterLines } from '../constants/story';
import type { SceneComponentProps } from '../types';

export const HeartLetterScene = memo(function HeartLetterScene({
  data,
  onNext,
  isActive,
}: SceneComponentProps) {
  const [spotlight, setSpotlight] = useState(false);
  const [landed, setLanded] = useState(false);
  const [opened, setOpened] = useState(false);
  const [paperOpen, setPaperOpen] = useState(false);
  const [writing, setWriting] = useState(false);
  const [showCta, setShowCta] = useState(false);

  const lines = useMemo(() => buildMotherLetterLines(data.customMessage), [data.customMessage]);

  useEffect(() => {
    if (!isActive) {
      setSpotlight(false);
      setLanded(false);
      setOpened(false);
      setPaperOpen(false);
      setWriting(false);
      setShowCta(false);
      return;
    }
    setSpotlight(true);
    const t = window.setTimeout(() => setLanded(true), 500);
    return () => clearTimeout(t);
  }, [isActive]);

  const openLetter = useCallback(() => {
    if (opened) return;
    setOpened(true);
    window.setTimeout(() => {
      setLanded(false);
      setPaperOpen(true);
      window.setTimeout(() => setWriting(true), 700);
    }, 700);
  }, [opened]);

  if (!isActive) return null;

  return (
    <SceneShell theme="dark" id="scene-heart-letter" className="!justify-center">
      <div className="mb-letter-stage">
        <div className={`mb-spotlight ${spotlight ? 'on' : ''}`} aria-hidden="true" />
        <span className="mb-eyebrow">Heart Letter</span>
        {!paperOpen && (
          <>
            <button
              type="button"
              className={`mb-envelope ${landed ? 'landed' : ''} ${opened ? 'opened' : ''}`}
              onClick={openLetter}
              aria-label="Open envelope"
            >
              <div className="mb-env-flower" aria-hidden="true">
                ✿
              </div>
              <div className="mb-env-body" />
              <div className="mb-env-wax" aria-hidden="true">
                C
              </div>
              <div className="mb-env-flap" />
            </button>
            <CTAButton show={landed && !opened} onClick={openLetter}>
              ❤️ Open My Letter
            </CTAButton>
          </>
        )}

        <div className={`mb-paper ${paperOpen ? 'open' : ''}`}>
          <div className="mb-paper-flower" aria-hidden="true">
            ✿
          </div>
          <HandwritingText
            lines={lines}
            active={writing}
            onComplete={() => window.setTimeout(() => setShowCta(true), 400)}
          />
        </div>

        <CTAButton show={showCta} onClick={onNext}>
          Hear My Voice
        </CTAButton>
      </div>
    </SceneShell>
  );
});
