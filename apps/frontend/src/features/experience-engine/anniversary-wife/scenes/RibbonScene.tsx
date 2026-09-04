'use client';

import { memo, useEffect, useState } from 'react';

import { CTAButton } from '../components/CTAButton';
import { SceneShell } from '../components/SceneShell';
import { RIBBON_STOPS } from '../constants/story';
import type { SceneComponentProps } from '../types';

export const RibbonScene = memo(function RibbonScene({ onNext, isActive }: SceneComponentProps) {
  const [trackGo, setTrackGo] = useState(false);
  const [visibleStops, setVisibleStops] = useState<boolean[]>(() => RIBBON_STOPS.map(() => false));
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [showCta, setShowCta] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setTrackGo(false);
      setVisibleStops(RIBBON_STOPS.map(() => false));
      setActiveCard(null);
      setShowCta(false);
      return;
    }

    const timers: number[] = [];
    timers.push(window.setTimeout(() => setTrackGo(true), 400));
    RIBBON_STOPS.forEach((_, idx) => {
      timers.push(
        window.setTimeout(() => {
          setVisibleStops((prev) => {
            const next = [...prev];
            next[idx] = true;
            return next;
          });
        }, 400 + 300 + idx * 420),
      );
    });
    timers.push(
      window.setTimeout(() => setShowCta(true), 400 + 400 + RIBBON_STOPS.length * 420),
    );

    return () => timers.forEach(clearTimeout);
  }, [isActive]);

  const handleStopClick = (idx: number) => {
    setActiveCard(idx);
    window.setTimeout(() => setActiveCard(null), 3200);
  };

  if (!isActive) return null;

  return (
    <SceneShell id="scene-wife-ribbon">
      <div className="aw-eyebrow">OUR JOURNEY TOGETHER</div>
      <h1 className="aw-title aw-title-sm">
        A ribbon, <em>woven through the years.</em>
      </h1>
      <div className="aw-ribbon-wrap">
        <div className={`aw-ribbon-track ${trackGo ? 'go' : ''}`} />
        <div className="aw-ribbon-stops">
          {RIBBON_STOPS.map((stop, i) => (
            <button
              key={stop.label}
              type="button"
              className={`aw-r-stop ${visibleStops[i] ? 'show' : ''}`}
              onClick={() => handleStopClick(i)}
              aria-label={stop.label}
            >
              <div className="aw-r-dot" />
              <div className="aw-r-label">{stop.label}</div>
            </button>
          ))}
        </div>
        {RIBBON_STOPS.map((stop, i) => (
          <div key={`card-${i}`} className={`aw-r-card ${activeCard === i ? 'show' : ''}`}>
            <div className="aw-r-card-icon">{stop.icon}</div>
            <div className="aw-r-card-q">{stop.quote}</div>
          </div>
        ))}
      </div>
      <CTAButton show={showCta} onClick={onNext} small>
        Continue
      </CTAButton>
    </SceneShell>
  );
});
