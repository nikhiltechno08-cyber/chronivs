'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { CTAButton } from '../components/CTAButton';
import { HEART_PATH } from '../components/PerfectHeart';
import { SceneContainer } from '../components/SceneContainer';
import type { SceneComponentProps } from '../types';

export const CelebrationScene = memo(function CelebrationScene({ onNext, isActive }: SceneComponentProps) {
  const [giftOpened, setGiftOpened] = useState(false);
  const [title, setTitle] = useState('');
  const [showCta, setShowCta] = useState(false);
  const explosionRef = useRef<HTMLDivElement>(null);

  const spawnExplosion = useCallback(() => {
    const layer = explosionRef.current;
    if (!layer) return;
    const rect = layer.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height * 0.35;
    const colors = ['var(--gold-bright)', 'var(--rose-gold)', 'var(--cream)', 'var(--soft-gold)'];

    for (let i = 0; i < 50; i++) {
      const el = document.createElement('div');
      el.className = 'confetti-bit';
      const size = 5 + Math.random() * 6;
      el.style.width = `${size}px`;
      el.style.height = `${size * 0.4}px`;
      el.style.background = colors[Math.floor(Math.random() * colors.length)]!;
      el.style.left = `${cx}px`;
      el.style.top = `${cy}px`;
      el.style.borderRadius = '1px';
      layer.appendChild(el);
      const ang = Math.random() * Math.PI * 2;
      const vel = 140 + Math.random() * 260;
      const dx = Math.cos(ang) * vel;
      const dy = Math.sin(ang) * vel - 200;
      el.animate(
        [
          { transform: 'translate(0,0) rotate(0deg)', opacity: '1' },
          { transform: `translate(${dx}px, ${dy + 420}px) rotate(${Math.random() * 720 - 360}deg)`, opacity: '0' },
        ],
        { duration: 1900 + Math.random() * 900, easing: 'cubic-bezier(.15,.7,.3,1)' },
      );
      window.setTimeout(() => el.remove(), 2900);
    }
  }, []);

  const openGift = useCallback(() => {
    if (giftOpened) return;
    setGiftOpened(true);
    window.setTimeout(() => spawnExplosion(), 250);
    window.setTimeout(() => setTitle('A Wish Wrapped With Love'), 700);
    window.setTimeout(() => setShowCta(true), 1400);
  }, [giftOpened, spawnExplosion]);

  useEffect(() => {
    if (!isActive) {
      setGiftOpened(false);
      setTitle('');
      setShowCta(false);
      return;
    }
    const fallback = window.setTimeout(() => {
      if (!giftOpened) setShowCta(true);
    }, 11000);
    return () => clearTimeout(fallback);
  }, [giftOpened, isActive]);

  if (!isActive) return null;

  return (
    <SceneContainer id="scene-celebration">
      <div className="eyebrow">One Wish, Waiting</div>
      <h1 className="serif" style={{ minHeight: '1.3em' }} id="celebrationTitle">
        {title}
      </h1>
      <div
        className={`gift-wrap ${giftOpened ? 'opened' : ''}`}
        id="giftWrap"
        onClick={openGift}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') openGift();
        }}
        role="button"
        tabIndex={0}
        aria-label="Open gift"
      >
        <div className="ribbon-v" />
        <div className="ribbon-h" />
        <div className="gift-box" />
        <div className="gift-lid" />
        <div className="bow" aria-hidden="true">
          <svg className="bow-heart l" viewBox="0 0 24 24">
            <path fill="currentColor" d={HEART_PATH} />
          </svg>
          <svg className="bow-heart r" viewBox="0 0 24 24">
            <path fill="currentColor" d={HEART_PATH} />
          </svg>
          <div className="knot" />
        </div>
      </div>
      <CTAButton show={showCta} onClick={onNext}>
        One Last Surprise
      </CTAButton>
      <div id="explosion" ref={explosionRef} aria-hidden="true" />
    </SceneContainer>
  );
});
