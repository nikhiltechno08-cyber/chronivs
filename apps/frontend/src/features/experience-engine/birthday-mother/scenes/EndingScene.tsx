'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { SceneShell } from '../components/SceneShell';
import type { SceneComponentProps } from '../types';

const ENDING_LINES = [
  'Happy Birthday Maa ❤️',
  'Every prayer you whispered became my future.',
] as const;

export const EndingScene = memo(function EndingScene({
  data,
  isActive,
  onExperienceEnd,
}: SceneComponentProps & { onExperienceEnd: () => void }) {
  const [giftOpened, setGiftOpened] = useState(false);
  const [letterOpen, setLetterOpen] = useState(false);
  const [lineCount, setLineCount] = useState(0);
  const [showSig, setShowSig] = useState(false);
  const [showTeddy, setShowTeddy] = useState(false);
  const [showCredit, setShowCredit] = useState(false);
  const [hint, setHint] = useState(true);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, delay: number) => {
    const id = window.setTimeout(fn, delay);
    timersRef.current.push(id);
  }, []);

  useEffect(() => {
    if (!isActive) {
      clearTimers();
      setGiftOpened(false);
      setLetterOpen(false);
      setLineCount(0);
      setShowSig(false);
      setShowTeddy(false);
      setShowCredit(false);
      setHint(true);
    }
  }, [clearTimers, isActive]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const openGift = useCallback(() => {
    if (giftOpened) return;
    setGiftOpened(true);
    setHint(false);
    schedule(() => {
      setLetterOpen(true);
      let n = 0;
      const write = () => {
        n += 1;
        setLineCount(n);
        if (n < ENDING_LINES.length) {
          schedule(write, 900);
        } else {
          schedule(() => setShowSig(true), 700);
          schedule(() => setShowTeddy(true), 1200);
          schedule(() => setShowCredit(true), 1800);
          schedule(() => onExperienceEnd(), 4200);
        }
      };
      schedule(write, 600);
    }, 900);
  }, [giftOpened, onExperienceEnd, schedule]);

  if (!isActive) return null;

  const sender = data.senderName || 'Your child';

  return (
    <SceneShell theme="dark" id="scene-ending">
      <div className="mb-ending-stage">
        {!letterOpen && (
          <>
            <span className="mb-eyebrow">A Final Gift</span>
            <button
              type="button"
              className={`mb-gift ${giftOpened ? 'opened' : ''}`}
              onClick={openGift}
              aria-label="Open birthday gift"
            >
              <div className="mb-gift-lid" />
              <div className="mb-gift-ribbon-v" />
              <div className="mb-gift-ribbon-h" />
              <div className="mb-gift-box" />
            </button>
            {hint && <p className="mb-sub">Tap the gift to open it.</p>}
          </>
        )}

        <div className={`mb-ending-letter ${letterOpen ? 'open' : ''}`}>
          {ENDING_LINES.map((line, i) => (
            <span key={line} className={`mb-ending-line ${i < lineCount ? 'show' : ''}`}>
              {line}
            </span>
          ))}
          <span className={`mb-ending-line ${showSig ? 'show' : ''}`} style={{ marginTop: 12 }}>
            Love,
            <br />
            {sender}
          </span>
        </div>

        <div className={`mb-teddy ${showTeddy ? 'show' : ''}`} aria-hidden="true">
          <div className="bear">
            <div className="ear l" />
            <div className="ear r" />
            <div className="head" />
            <div className="eye l" />
            <div className="eye r" />
            <div className="muzzle" />
            <div className="arm l" />
            <div className="arm r" />
          </div>
        </div>

        <div className={`mb-credit ${showCredit ? 'show' : ''}`}>Made with Chronivs</div>
      </div>
    </SceneShell>
  );
});
