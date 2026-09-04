'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';

import {
  LITTLE_THINGS_CAPTIONS,
  LITTLE_THINGS_LINES,
  LITTLE_THINGS_PLACEHOLDERS,
  resolveLittleThingsPhotos,
} from '../constants/story';
import { SceneShell } from '../components/SceneShell';
import type { SceneComponentProps } from '../types';

function spawnBurst(x: number, y: number) {
  const colors = ['#e8c98d', '#ffe3a3', '#d9a79c', '#f6eee2'];
  for (let i = 0; i < 8; i++) {
    const p = document.createElement('span');
    p.className = 'prop-lt-spark';
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.background = colors[i % colors.length]!;
    p.style.setProperty('--dx', `${(Math.random() - 0.5) * 48}px`);
    p.style.setProperty('--dy', `${-20 - Math.random() * 36}px`);
    document.body.appendChild(p);
    window.setTimeout(() => p.remove(), 900);
  }
}

export const LittleThingsScene = memo(function LittleThingsScene({
  data,
  onNext,
  isActive,
}: SceneComponentProps) {
  const photos = resolveLittleThingsPhotos(data);
  const [visibleLineCount, setVisibleLineCount] = useState(0);
  const [visiblePolaroidCount, setVisiblePolaroidCount] = useState(0);
  const [tapped, setTapped] = useState<boolean[]>(() => [false, false, false]);
  const [captions, setCaptions] = useState<(string | null)[]>(() => [null, null, null]);
  const [readyForTap, setReadyForTap] = useState(false);
  const [exiting, setExiting] = useState(false);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    if (!isActive) {
      clearTimers();
      setVisibleLineCount(0);
      setVisiblePolaroidCount(0);
      setTapped([false, false, false]);
      setCaptions([null, null, null]);
      setReadyForTap(false);
      setExiting(false);
      return;
    }

    let lineIdx = 0;
    const revealLine = () => {
      if (lineIdx >= LITTLE_THINGS_LINES.length) {
        const t = window.setTimeout(() => setVisiblePolaroidCount(1), 400);
        timersRef.current.push(t);
        return;
      }
      lineIdx += 1;
      setVisibleLineCount(lineIdx);
      const t = window.setTimeout(revealLine, 1400);
      timersRef.current.push(t);
    };
    const start = window.setTimeout(revealLine, 600);
    timersRef.current.push(start);

    return clearTimers;
  }, [clearTimers, isActive]);

  useEffect(() => {
    if (!isActive || visiblePolaroidCount === 0) return;
    if (visiblePolaroidCount >= 3) {
      const t = window.setTimeout(() => setReadyForTap(true), 500);
      timersRef.current.push(t);
      return;
    }
    const t = window.setTimeout(() => setVisiblePolaroidCount((c) => c + 1), 800);
    timersRef.current.push(t);
  }, [isActive, visiblePolaroidCount]);

  const handlePolaroidTap = useCallback(
    (index: number, e: React.MouseEvent<HTMLButtonElement>) => {
      if (!readyForTap || exiting || tapped[index]) return;

      const rect = e.currentTarget.getBoundingClientRect();
      spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);

      setTapped((prev) => {
        const next = [...prev];
        next[index] = true;
        if (next.every(Boolean)) {
          setExiting(true);
          timersRef.current.push(window.setTimeout(() => onNext(), 1800));
        }
        return next;
      });
      setCaptions((prev) => {
        const next = [...prev];
        next[index] = LITTLE_THINGS_CAPTIONS[index]!;
        return next;
      });
    },
    [exiting, onNext, readyForTap, tapped],
  );

  if (!isActive) return null;

  return (
    <SceneShell id="scene-prop-little-things">
      <div className={`prop-little-things-stage${exiting ? ' leaving' : ''}`}>
        <p className="prop-eyebrow prop-lt-reveal" style={{ animationDelay: '0.1s' }}>
          The Little Things
        </p>

        <div className="prop-lt-lines" aria-live="polite">
          {LITTLE_THINGS_LINES.map((line, i) => (
            <p
              key={line}
              className={`prop-line prop-lt-line${i < visibleLineCount ? ' show' : ''}`}
            >
              {line}
            </p>
          ))}
        </div>

        <div className={`prop-lt-polaroids${exiting ? ' exit' : ''}`}>
          {[0, 1, 2].map((i) => {
            const photoUrl = photos[i];
            const placeholder = LITTLE_THINGS_PLACEHOLDERS[i]!;
            const isVisible = i < visiblePolaroidCount;
            const isTapped = tapped[i];
            return (
              <button
                key={i}
                type="button"
                className={`prop-lt-polaroid prop-lt-polaroid-${i}${isVisible ? ' visible' : ''}${readyForTap && !isTapped ? ' pulse' : ''}${isTapped ? ' tapped active' : ''}`}
                style={{ animationDelay: `${i * 0.15}s` }}
                onClick={(e) => handlePolaroidTap(i, e)}
                aria-label={LITTLE_THINGS_CAPTIONS[i]}
                disabled={!readyForTap || isTapped || exiting}
              >
                <div className="prop-lt-polaroid-inner">
                  {photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoUrl} alt={LITTLE_THINGS_CAPTIONS[i] ?? 'Memory photo'} loading="lazy" decoding="async" />
                  ) : (
                    <div
                      className="prop-lt-placeholder"
                      style={{ background: placeholder.gradient }}
                    >
                      <span aria-hidden="true">{placeholder.emoji}</span>
                    </div>
                  )}
                </div>
                {captions[i] && <span className="prop-lt-caption">{captions[i]}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </SceneShell>
  );
});
