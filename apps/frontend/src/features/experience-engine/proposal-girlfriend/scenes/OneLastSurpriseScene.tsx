'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { ONE_LAST_SURPRISE_LINES } from '../constants/story';
import { SceneShell } from '../components/SceneShell';
import type { SceneComponentProps } from '../types';

const LID_OPEN_MS = 1100;
const RING_RISE_MS = 3200;
const RING_HOLD_MS = 2400;
const DISSOLVE_MS = 2000;
const OPEN_MS = LID_OPEN_MS + RING_RISE_MS;

function spawnRingDissolve(x: number, y: number) {
  for (let i = 0; i < 44; i++) {
    const p = document.createElement('span');
    p.className = 'prop-ols-particle';
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.setProperty('--ols-dx', `${(Math.random() - 0.5) * 320}px`);
    p.style.setProperty('--ols-dy', `${-60 - Math.random() * 260}px`);
    p.style.setProperty('--ols-dur', `${1.5 + Math.random() * 1.4}s`);
    p.style.animationDelay = `${Math.random() * 0.4}s`;
    document.body.appendChild(p);
    window.setTimeout(() => p.remove(), 3200);
  }
}

type Phase = 'intro' | 'ready' | 'opening' | 'ring-only' | 'dissolving';

type OneLastSurpriseSceneProps = SceneComponentProps & {
  onTransitionStart?: () => void;
};

export const OneLastSurpriseScene = memo(function OneLastSurpriseScene({
  onNext,
  isActive,
  onTransitionStart,
}: OneLastSurpriseSceneProps) {
  const [visibleLineCount, setVisibleLineCount] = useState(0);
  const [boxVisible, setBoxVisible] = useState(false);
  const [phase, setPhase] = useState<Phase>('intro');
  const ringRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    if (!isActive) {
      clearTimers();
      setVisibleLineCount(0);
      setBoxVisible(false);
      setPhase('intro');
      return;
    }

    timersRef.current.push(window.setTimeout(() => setBoxVisible(true), 500));

    let lineIdx = 0;
    const revealLine = () => {
      if (lineIdx >= ONE_LAST_SURPRISE_LINES.length) {
        timersRef.current.push(window.setTimeout(() => setPhase('ready'), 800));
        return;
      }
      lineIdx += 1;
      setVisibleLineCount(lineIdx);
      timersRef.current.push(window.setTimeout(revealLine, 1600));
    };
    timersRef.current.push(window.setTimeout(revealLine, 900));

    return clearTimers;
  }, [clearTimers, isActive]);

  const handleBoxTap = useCallback(() => {
    if (phase !== 'ready') return;
    setPhase('opening');
    onTransitionStart?.();

    timersRef.current.push(window.setTimeout(() => setPhase('ring-only'), OPEN_MS));
    timersRef.current.push(
      window.setTimeout(() => {
        setPhase('dissolving');
        const el = ringRef.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          spawnRingDissolve(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
      }, OPEN_MS + RING_HOLD_MS),
    );
    timersRef.current.push(
      window.setTimeout(() => onNext(), OPEN_MS + RING_HOLD_MS + DISSOLVE_MS),
    );
  }, [onNext, onTransitionStart, phase]);

  if (!isActive) return null;

  const showCopy = phase !== 'ring-only' && phase !== 'dissolving';
  const isOpen = phase === 'opening' || phase === 'ring-only' || phase === 'dissolving';

  return (
    <SceneShell id="scene-prop-one-last-surprise">
      <div
        className={`prop-ols-stage${boxVisible ? ' box-in' : ''}${phase !== 'intro' && phase !== 'ready' ? ` ${phase}` : ''}`}
      >
        {showCopy && (
          <div className={`prop-ols-copy${phase === 'opening' ? ' fade-out' : ''}`}>
            <p className="prop-eyebrow prop-ols-reveal">One Last Surprise</p>
            <div className="prop-ols-lines" aria-live="polite">
              {ONE_LAST_SURPRISE_LINES.map((line, i) => (
                <p key={line} className={`prop-line prop-ols-line${i < visibleLineCount ? ' show' : ''}`}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="prop-ols-box-wrap">
          <button
            type="button"
            className={`prop-ols-box${phase === 'ready' ? ' glow-ready' : ''}${isOpen ? ' open' : ''}${phase === 'dissolving' ? ' dissolve' : ''}`}
            onClick={handleBoxTap}
            disabled={phase !== 'ready'}
            aria-label={phase === 'ready' ? 'Open the ring box' : 'Engagement ring'}
          >
            <div className="prop-ols-unit">
              <span className="prop-ols-glow" aria-hidden="true" />
              <span className="prop-ols-orbit" aria-hidden="true">
                {Array.from({ length: 8 }).map((_, i) => (
                  <span key={i} className="prop-ols-orbit-dot" style={{ ['--i' as string]: i }} />
                ))}
              </span>

              <div className="prop-ols-bottom" aria-hidden="true">
                <span className="prop-ols-interior">
                  <span className="prop-ols-cushion">
                    <span className="prop-ols-slot" />
                  </span>
                </span>
                <span className="prop-ols-inner-light" />
              </div>

              <div className="prop-ols-lid-hinge" aria-hidden="true">
                <div className="prop-ols-lid">
                  <span className="prop-ols-lid-face" />
                  <span className="prop-ols-lid-rim" />
                </div>
              </div>

              {/* Sibling of the lid, never a child of the box body — the ring
                  has to rise in front of both as it lifts out. */}
              <div className="prop-ols-ring-lift" aria-hidden="true">
                <div ref={ringRef} className="prop-ols-ring">
                  <span className="prop-ols-band" />
                  <span className="prop-ols-diamond" />
                  <span className="prop-ols-spark" />
                  <span className="prop-ols-spark prop-ols-spark-2" />
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </SceneShell>
  );
});
