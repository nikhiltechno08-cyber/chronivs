'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { CTAButton } from '../components/CTAButton';
import { SceneShell } from '../components/SceneShell';
import { TypewriterText } from '../components/TypewriterText';
import { buildWifeLetterLines } from '../constants/story';
import type { SceneComponentProps } from '../types';

export const LetterScene = memo(function LetterScene({ data, onNext, isActive }: SceneComponentProps) {
  const [opened, setOpened] = useState(false);
  const [writing, setWriting] = useState(false);
  const [showRose, setShowRose] = useState(false);
  const [showCta, setShowCta] = useState(false);
  const timersRef = useRef<number[]>([]);

  const herName = data.receiverName || 'my love';
  const lines = useMemo(
    () => buildWifeLetterLines(data.customMessage, herName),
    [data.customMessage, herName],
  );

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    if (!isActive) {
      clearTimers();
      setOpened(false);
      setWriting(false);
      setShowRose(false);
      setShowCta(false);
    }
    return clearTimers;
  }, [clearTimers, isActive]);

  const openEnvelope = useCallback(() => {
    if (opened) return;
    setOpened(true);
    const t = window.setTimeout(() => setWriting(true), 750);
    timersRef.current.push(t);
  }, [opened]);

  const handleWritingComplete = useCallback(() => {
    setShowRose(true);
    const t = window.setTimeout(() => setShowCta(true), 900);
    timersRef.current.push(t);
  }, []);

  if (!isActive) return null;

  return (
    <SceneShell id="scene-wife-letter" className={opened ? 'aw-letter-open' : ''}>
      <div className={`aw-letter-eyebrow ${opened ? 'is-hidden' : ''}`}>
        A LETTER MY HEART COULD NEVER STOP WRITING
      </div>
      <div className="aw-letter-stage">
        <button
          type="button"
          className={`aw-env-wrap ${opened ? 'open' : ''}`}
          onClick={openEnvelope}
          aria-label="Tap the seal to open it"
          disabled={opened}
        >
          <div className="aw-env-back" aria-hidden="true" />
          <div className="aw-flap" aria-hidden="true" />
          <div className="aw-seal" aria-hidden="true">
            ❤
          </div>
        </button>
        <div className={`aw-letter-page ${opened ? 'show' : ''}`} aria-hidden={!opened}>
          <div className="aw-letter-paper">
            <TypewriterText lines={lines} active={writing} onComplete={handleWritingComplete} />
          </div>
        </div>
      </div>
      <div className={`aw-rose-pressed ${showRose ? 'show' : ''}`}>🌹</div>
      {!opened && <div className="aw-tap-hint">Tap the seal to open it</div>}
      <CTAButton show={showCta} onClick={onNext} small>
        One More Memory
      </CTAButton>
    </SceneShell>
  );
});
