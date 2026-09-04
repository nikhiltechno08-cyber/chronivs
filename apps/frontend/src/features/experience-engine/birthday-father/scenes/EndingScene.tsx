'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { PhotoFace } from '../components/PhotoFace';
import { SceneShell } from '../components/SceneShell';
import { resolveFatherPhotos } from '../constants/story';
import type { SceneComponentProps } from '../types';

/** HTML Chapter Twelve — gift box finale on light parchment */
export const EndingScene = memo(function EndingScene({
  data,
  isActive,
  onExperienceEnd,
}: SceneComponentProps & { onExperienceEnd: () => void }) {
  const photos = resolveFatherPhotos(data.photos);
  const [opened, setOpened] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [showLove, setShowLove] = useState(false);
  const [showFeet, setShowFeet] = useState(0);
  const [showLogo, setShowLogo] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
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
      setOpened(false);
      setShowHeart(false);
      setShowLove(false);
      setShowFeet(0);
      setShowLogo(false);
      setShowQuote(false);
    }
  }, [clearTimers, isActive]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const openGift = useCallback(() => {
    if (opened) return;
    setOpened(true);
    schedule(() => setShowHeart(true), 1700);
    schedule(() => setShowLove(true), 2300);
    schedule(() => setShowFeet(1), 3200);
    schedule(() => setShowFeet(2), 3600);
    schedule(() => setShowFeet(3), 4000);
    schedule(() => setShowLogo(true), 4600);
    schedule(() => {
      setShowQuote(true);
      onExperienceEnd();
    }, 5600);
  }, [opened, onExperienceEnd, schedule]);

  if (!isActive) return null;

  const fatherName = data.receiverName || 'Papa';
  const sender = data.senderName || 'Loving Child';

  return (
    <SceneShell theme="light" id="scene-father-ending">
      <span className="fb-chapter">Chapter — The Ending</span>

      <button
        type="button"
        className={`fb-gift-wrap ${opened ? 'open' : ''}`}
        onClick={openGift}
        aria-label="Open the gift"
        disabled={opened}
      >
        <div className="fb-gift-lid" />
        <div className="fb-gift-box">
          <div className="fb-gift-ribbon-v" />
        </div>
        <div className="fb-gift-bow" aria-hidden="true" />
        <div className={`fb-rise-photo ${opened ? 'show' : ''}`}>
          {photos[0] ? (
            <PhotoFace photoUrl={photos[0]} slotIndex={0} alt="" />
          ) : (
            <span aria-hidden="true">👨‍👧‍👦</span>
          )}
        </div>
      </button>

      <div className={`fb-heart-mark ${showHeart ? 'show' : ''}`} aria-hidden="true">
        ❤
      </div>

      <p className={`fb-love-line ${showLove ? 'show' : ''}`}>
        Happy Birthday {fatherName} ❤️
        <br />
        Love, {sender}
      </p>

      <div className="fb-footprints" aria-hidden="true">
        <span className={showFeet >= 1 ? 'show' : ''}>👣</span>
        <span className={showFeet >= 2 ? 'show' : ''}>👣</span>
        <span className={showFeet >= 3 ? 'show' : ''}>👣</span>
      </div>

      <div className={`fb-logo-word ${showLogo ? 'show' : ''}`}>CHRONIVS</div>

      <p className={`fb-final-quote ${showQuote ? 'show' : ''}`}>
        &ldquo;Some heroes never wear capes. They simply answer to one name... {fatherName}.&rdquo;
      </p>
    </SceneShell>
  );
});
