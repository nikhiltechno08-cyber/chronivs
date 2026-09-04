'use client';

import { memo, useEffect, useState, type MouseEvent } from 'react';

import { CTAButton } from '../components/CTAButton';
import { ExperienceModal } from '../components/ExperienceModal';
import { SceneShell } from '../components/SceneShell';
import { LANTERN_LESSONS, LANTERN_POSITIONS } from '../constants/story';
import type { SceneComponentProps } from '../types';

export const LanternsScene = memo(function LanternsScene({ onNext, isActive }: SceneComponentProps) {
  const [opened, setOpened] = useState<Set<number>>(new Set());
  const [active, setActive] = useState<number | null>(null);
  const [showCta, setShowCta] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setOpened(new Set());
      setActive(null);
      setShowCta(false);
      return;
    }
    const t = window.setTimeout(() => setShowCta(true), 7000);
    return () => clearTimeout(t);
  }, [isActive]);

  useEffect(() => {
    if (opened.size >= 2) setShowCta(true);
  }, [opened.size]);

  if (!isActive) return null;

  const openLantern = (e: MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setActive(index);
    setOpened((prev) => new Set(prev).add(index));
  };

  return (
    <SceneShell theme="light" id="scene-father-lanterns">
      <span className="fb-chapter">Chapter Six — The Lessons</span>
      <h1 className="fb-title fb-title-light" style={{ fontSize: 'clamp(20px,3.6vw,30px)' }}>
        Lanterns of wisdom, <em>lit by you.</em>
      </h1>
      <p className="fb-sub fb-sub-light">Tap a lantern to open a quiet truth.</p>

      <div className="fb-lantern-field">
        {LANTERN_POSITIONS.map((pos, i) => (
          <button
            key={LANTERN_LESSONS[i]}
            type="button"
            className={`fb-lantern ${opened.has(i) ? 'lit' : ''}`}
            style={{ top: pos.top, left: pos.left, animationDelay: `${i * 0.45}s` }}
            onClick={(e) => openLantern(e, i)}
            aria-label={`Open lesson: ${LANTERN_LESSONS[i]}`}
          >
            <span className="fb-lantern-glow" aria-hidden="true" />
            <span className="fb-lantern-body" aria-hidden="true" />
            <span className="fb-lantern-flame" aria-hidden="true" />
          </button>
        ))}
      </div>

      <CTAButton show={showCta} onClick={onNext} className="fb-cta-light">
        Hear His Voice
      </CTAButton>

      <ExperienceModal
        open={active !== null}
        onClose={() => setActive(null)}
        ariaLabel="Wisdom"
        glass
      >
        <p className="fb-glass-quote">{active !== null ? LANTERN_LESSONS[active] : ''}</p>
        <button type="button" className="fb-modal-close" onClick={() => setActive(null)}>
          Close
        </button>
      </ExperienceModal>
    </SceneShell>
  );
});
