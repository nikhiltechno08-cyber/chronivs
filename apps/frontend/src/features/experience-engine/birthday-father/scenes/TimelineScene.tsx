'use client';

import { memo, useEffect, useState, type MouseEvent } from 'react';

import { CTAButton } from '../components/CTAButton';
import { ExperienceModal } from '../components/ExperienceModal';
import { SceneShell } from '../components/SceneShell';
import { TIMELINE_STOPS } from '../constants/story';
import type { SceneComponentProps } from '../types';

export const TimelineScene = memo(function TimelineScene({ onNext, isActive }: SceneComponentProps) {
  const [revealed, setRevealed] = useState(0);
  const [pathOn, setPathOn] = useState(false);
  const [showCta, setShowCta] = useState(false);
  const [activeStop, setActiveStop] = useState<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      setRevealed(0);
      setPathOn(false);
      setShowCta(false);
      setActiveStop(null);
      return;
    }

    setPathOn(true);
    const timers: number[] = [];
    TIMELINE_STOPS.forEach((_, i) => {
      timers.push(window.setTimeout(() => setRevealed(i + 1), 600 + i * 700));
    });
    timers.push(window.setTimeout(() => setShowCta(true), 600 + TIMELINE_STOPS.length * 700 + 400));

    return () => timers.forEach(clearTimeout);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <SceneShell theme="light" id="scene-father-timeline">
      <span className="fb-chapter">Chapter Three — The Journey</span>
      <h1 className="fb-title fb-title-light" style={{ fontSize: 'clamp(22px,4vw,34px)' }}>
        Every year, <em>you were there.</em>
      </h1>
      <p className="fb-sub fb-sub-light">Watch the years unfold — or tap a stop to hold it closer.</p>

      <div className="fb-timeline">
        <div className={`fb-timeline-path ${pathOn ? 'fill' : ''}`} aria-hidden="true" />
        {TIMELINE_STOPS.map((stop, i) => (
          <button
            key={stop.age}
            type="button"
            className={`fb-timeline-stop ${i < revealed ? 'show' : ''} ${activeStop === i ? 'active' : ''}`}
            onClick={(e: MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveStop(i);
            }}
            aria-label={`${stop.age}: ${stop.quote}`}
            disabled={i >= revealed}
          >
            <span className="fb-timeline-dot" />
            <span className="fb-timeline-age">{stop.age}</span>
            <span className="fb-timeline-quote">{stop.quote}</span>
          </button>
        ))}
      </div>

      <CTAButton show={showCta} onClick={onNext} className="fb-cta-light">
        Hold These Hands
      </CTAButton>

      <ExperienceModal
        open={activeStop !== null}
        onClose={() => setActiveStop(null)}
        ariaLabel="Timeline memory"
      >
        <p className="fb-modal-age">{activeStop !== null ? TIMELINE_STOPS[activeStop]?.age : ''}</p>
        <p className="fb-modal-quote">{activeStop !== null ? TIMELINE_STOPS[activeStop]?.quote : ''}</p>
        <button type="button" className="fb-modal-close" onClick={() => setActiveStop(null)}>
          Close
        </button>
      </ExperienceModal>
    </SceneShell>
  );
});
