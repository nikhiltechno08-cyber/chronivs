'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { CTAButton } from '../components/CTAButton';
import { HandwritingText } from '../components/HandwritingText';
import { SceneShell } from '../components/SceneShell';
import { buildFatherLetterLines } from '../constants/story';
import type { SceneComponentProps } from '../types';

export const LetterScene = memo(function LetterScene({ data, onNext, isActive }: SceneComponentProps) {
  const [landed, setLanded] = useState(false);
  const [opened, setOpened] = useState(false);
  const [writing, setWriting] = useState(false);
  const [showCta, setShowCta] = useState(false);
  const timersRef = useRef<number[]>([]);

  const fatherName = data.receiverName || 'Papa';
  const lines = useMemo(
    () => buildFatherLetterLines(data.customMessage, fatherName),
    [data.customMessage, fatherName],
  );

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    if (!isActive) {
      clearTimers();
      setLanded(false);
      setOpened(false);
      setWriting(false);
      setShowCta(false);
      return;
    }
    const t = window.setTimeout(() => setLanded(true), 280);
    timersRef.current.push(t);
    return clearTimers;
  }, [clearTimers, isActive]);

  const handleWritingComplete = useCallback(() => {
    const t = window.setTimeout(() => setShowCta(true), 500);
    timersRef.current.push(t);
  }, []);

  const openLetter = useCallback(() => {
    if (opened) return;
    setOpened(true);
    const t = window.setTimeout(() => setWriting(true), 1100);
    timersRef.current.push(t);
  }, [opened]);

  if (!isActive) return null;

  return (
    <SceneShell theme="light" id="scene-father-letter" className="fb-letter-shell">
      <div className={`fb-letter-stack ${landed ? 'show' : ''}`}>
        <p className="fb-letter-chapter">Chapter Eight — The Letter</p>

        <div className={`fb-envelope-stage ${opened ? 'open' : ''}`}>
          <button
            type="button"
            className={`fb-envelope-wrap ${opened ? 'open' : ''}`}
            onClick={openLetter}
            aria-label="Tap the envelope to open it"
            disabled={opened}
          >
            <div className="fb-envelope-back" aria-hidden="true" />
            <div className={`fb-letter-sheet ${opened ? 'rise' : ''}`}>
              <div className="fb-letter-body">
                <HandwritingText lines={lines} active={writing} onComplete={handleWritingComplete} />
              </div>
            </div>
            <div className="fb-envelope-flap" aria-hidden="true" />
            <div className="fb-envelope-seal" aria-hidden="true">
              <span>✦</span>
            </div>
          </button>
        </div>

        <p className={`fb-letter-tap ${opened ? 'hide' : ''}`}>Tap the envelope to open it</p>

        <CTAButton show={showCta} onClick={onNext} className="fb-cta-light">
          Celebrate Him
        </CTAButton>
      </div>
    </SceneShell>
  );
});
