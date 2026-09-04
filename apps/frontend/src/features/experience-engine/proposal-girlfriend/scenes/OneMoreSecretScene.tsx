'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { ONE_MORE_SECRET_LINES } from '../constants/story';
import { SceneShell } from '../components/SceneShell';
import type { SceneComponentProps } from '../types';

function spawnGoldenDust(x: number, y: number) {
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('span');
    p.className = 'prop-oms-dust';
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.setProperty('--oms-dx', `${(Math.random() - 0.5) * 160}px`);
    p.style.setProperty('--oms-dy', `${-20 - Math.random() * 120}px`);
    p.style.setProperty('--oms-dur', `${0.9 + Math.random() * 0.8}s`);
    p.style.animationDelay = `${Math.random() * 0.25}s`;
    document.body.appendChild(p);
    window.setTimeout(() => p.remove(), 2000);
  }
}

function playSealCrack() {
  try {
    const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.value = 0.06;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    window.setTimeout(() => void ctx.close(), 300);
  } catch {
    /* audio optional */
  }
}

type OneMoreSecretSceneProps = SceneComponentProps & {
  onTransitionStart?: () => void;
};

export const OneMoreSecretScene = memo(function OneMoreSecretScene({
  onNext,
  isActive,
  onTransitionStart,
}: OneMoreSecretSceneProps) {
  const [visibleLineCount, setVisibleLineCount] = useState(0);
  const [sealReady, setSealReady] = useState(false);
  const [sealCracking, setSealCracking] = useState(false);
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const sealRef = useRef<HTMLButtonElement>(null);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    if (!isActive) {
      clearTimers();
      setVisibleLineCount(0);
      setSealReady(false);
      setSealCracking(false);
      setEnvelopeOpen(false);
      return;
    }

    let lineIdx = 0;
    const revealLine = () => {
      if (lineIdx >= ONE_MORE_SECRET_LINES.length) {
        timersRef.current.push(window.setTimeout(() => setSealReady(true), 700));
        return;
      }
      lineIdx += 1;
      setVisibleLineCount(lineIdx);
      timersRef.current.push(window.setTimeout(revealLine, 1500));
    };
    timersRef.current.push(window.setTimeout(revealLine, 600));

    return clearTimers;
  }, [clearTimers, isActive]);

  const handleSealTap = useCallback(() => {
    if (sealCracking || envelopeOpen || !sealReady) return;
    setSealCracking(true);
    onTransitionStart?.();
    playSealCrack();

    const el = sealRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      spawnGoldenDust(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }

    timersRef.current.push(
      window.setTimeout(() => {
        setEnvelopeOpen(true);
      }, 550),
    );
    timersRef.current.push(window.setTimeout(() => onNext(), 4800));
  }, [envelopeOpen, onNext, onTransitionStart, sealCracking, sealReady]);

  if (!isActive) return null;

  return (
    <SceneShell id="scene-prop-one-more-secret">
      <div className={`prop-oms-stage${envelopeOpen ? ' opening' : ''}`}>
        <div className={`prop-oms-copy${envelopeOpen ? ' fade-out' : ''}`}>
          <p className="prop-eyebrow prop-oms-reveal">One More Secret...</p>
          <div className="prop-oms-lines">
            {ONE_MORE_SECRET_LINES.map((line, i) => (
              <p key={line} className={`prop-line prop-oms-line${i < visibleLineCount ? ' show' : ''}`}>
                {line}
              </p>
            ))}
          </div>
        </div>

        <div className="prop-oms-envelope-wrap">
          <div
            className={`prop-oms-envelope${envelopeOpen ? ' open' : ''}${sealReady ? ' seal-ready' : ''}`}
          >
            <div className="prop-oms-body" aria-hidden="true" />
            <div className="prop-oms-flap" aria-hidden="true" />
            <div className="prop-oms-paper" aria-hidden="true" />
            {sealReady && !envelopeOpen && (
              <button
                ref={sealRef}
                type="button"
                className={`prop-oms-wax${sealCracking ? ' cracking' : ''}`}
                onClick={handleSealTap}
                aria-label="Break the wax seal and open the letter"
                disabled={sealCracking}
              >
                <span className="prop-oms-wax-glow" aria-hidden="true" />
                <span className="prop-oms-wax-mark" aria-hidden="true">
                  ✦
                </span>
                <span className="prop-oms-wax-crack" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </SceneShell>
  );
});
