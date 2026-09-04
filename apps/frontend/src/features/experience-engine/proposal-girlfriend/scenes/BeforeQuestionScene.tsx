'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { BEFORE_QUESTION_LINES } from '../constants/story';
import { SceneShell } from '../components/SceneShell';
import type { SceneComponentProps } from '../types';

function spawnGoldenDissolve(x: number, y: number) {
  for (let i = 0; i < 36; i++) {
    const p = document.createElement('span');
    p.className = 'prop-bq-particle';
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.setProperty('--bq-dx', `${(Math.random() - 0.5) * 280}px`);
    p.style.setProperty('--bq-dy', `${-40 - Math.random() * 220}px`);
    p.style.setProperty('--bq-dur', `${1.4 + Math.random() * 1.2}s`);
    p.style.animationDelay = `${Math.random() * 0.35}s`;
    document.body.appendChild(p);
    window.setTimeout(() => p.remove(), 2800);
  }
}

type BeforeQuestionSceneProps = SceneComponentProps & {
  onTransitionStart?: () => void;
};

export const BeforeQuestionScene = memo(function BeforeQuestionScene({
  onNext,
  isActive,
  onTransitionStart,
}: BeforeQuestionSceneProps) {
  const [visibleLineCount, setVisibleLineCount] = useState(0);
  const [showHeart, setShowHeart] = useState(false);
  const [dissolving, setDissolving] = useState(false);
  const heartRef = useRef<HTMLButtonElement>(null);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    if (!isActive) {
      clearTimers();
      setVisibleLineCount(0);
      setShowHeart(false);
      setDissolving(false);
      return;
    }

    let lineIdx = 0;
    const revealLine = () => {
      if (lineIdx >= BEFORE_QUESTION_LINES.length) {
        const t = window.setTimeout(() => setShowHeart(true), 900);
        timersRef.current.push(t);
        return;
      }
      lineIdx += 1;
      setVisibleLineCount(lineIdx);
      const t = window.setTimeout(revealLine, 1600);
      timersRef.current.push(t);
    };
    const start = window.setTimeout(revealLine, 700);
    timersRef.current.push(start);

    return clearTimers;
  }, [clearTimers, isActive]);

  const handleHeartTap = useCallback(() => {
    if (dissolving) return;
    setDissolving(true);
    onTransitionStart?.();

    const el = heartRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      spawnGoldenDissolve(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }

    timersRef.current.push(window.setTimeout(() => onNext(), 2200));
  }, [dissolving, onNext, onTransitionStart]);

  if (!isActive) return null;

  return (
    <SceneShell id="scene-prop-before-question">
      <div className={`prop-bq-stage${dissolving ? ' dissolving' : ''}`}>
        <p className="prop-eyebrow prop-bq-reveal" style={{ animationDelay: '0.15s' }}>
          Before The Question
        </p>

        <div className="prop-bq-lines" aria-live="polite">
          {BEFORE_QUESTION_LINES.map((line, i) => (
            <p key={line} className={`prop-line prop-bq-line${i < visibleLineCount ? ' show' : ''}`}>
              {line}
            </p>
          ))}
        </div>

        {showHeart && (
          <button
            ref={heartRef}
            type="button"
            className={`prop-bq-heart${dissolving ? ' to-light' : ''}`}
            onClick={handleHeartTap}
            aria-label="Continue to the question"
            disabled={dissolving}
          >
            <span className="prop-bq-heart-glow" aria-hidden="true" />
            <span className="prop-bq-heart-icon" aria-hidden="true">
              ❤
            </span>
          </button>
        )}
      </div>
    </SceneShell>
  );
});
