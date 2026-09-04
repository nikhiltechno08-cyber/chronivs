'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';

const CELEBRATION_COLORS = ['#E8C39E', '#D9A79C', '#7B2D3E', '#F3C98B'];

export function spawnMiniHearts(btn: HTMLElement) {
  const rect = btn.getBoundingClientRect();
  for (let i = 0; i < 5; i++) {
    const h = document.createElement('span');
    h.className = 'aw-mini-heart';
    h.textContent = '❤';
    h.style.left = `${rect.left + rect.width * Math.random()}px`;
    h.style.top = `${rect.top - 6}px`;
    h.style.position = 'fixed';
    h.style.animationDelay = `${i * 0.08}s`;
    document.body.appendChild(h);
    window.setTimeout(() => h.remove(), 1600);
  }
}

type CelebrationFxProps = {
  active?: boolean;
  light?: boolean;
  containerRef?: React.RefObject<HTMLElement | null>;
};

export const CelebrationFx = memo(function CelebrationFx({
  active = false,
  light = false,
  containerRef,
}: CelebrationFxProps) {
  const [elements, setElements] = useState<React.ReactNode[]>([]);
  const idRef = useRef(0);

  const spawn = useCallback(
    (isLight = false) => {
      const n = isLight ? 5 : 10;
      const items: React.ReactNode[] = [];
      const baseId = idRef.current;

      for (let k = 0; k < n; k++) {
        const id = `balloon-${baseId}-${k}`;
        items.push(
          <div
            key={id}
            className="aw-balloon2"
            style={{
              left: `${10 + Math.random() * 80}%`,
              background: CELEBRATION_COLORS[k % CELEBRATION_COLORS.length],
              ['--drift' as string]: `${Math.random() * 80 - 40}px`,
              animationDuration: `${7 + Math.random() * 4}s`,
              animationDelay: `${Math.random() * 1.2}s`,
            }}
          />,
        );
      }

      if (!isLight) {
        for (let k = 0; k < 18; k++) {
          const size = 6 + Math.random() * 10;
          items.push(
            <div
              key={`bubble-${baseId}-${k}`}
              className="aw-bubble"
              style={{
                width: size,
                height: size,
                left: `${Math.random() * 100}%`,
                animationDuration: `${5 + Math.random() * 4}s`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />,
          );
        }
      }

      for (let k = 0; k < (isLight ? 18 : 36); k++) {
        items.push(
          <div
            key={`confetti-${baseId}-${k}`}
            className="aw-confetti2"
            style={{
              left: `${Math.random() * 100}%`,
              background: CELEBRATION_COLORS[k % CELEBRATION_COLORS.length],
              animationDuration: `${3 + Math.random() * 2.5}s`,
              animationDelay: `${Math.random() * 1.4}s`,
            }}
          />,
        );
      }

      idRef.current += 1;
      setElements(items);

      const maxDur = isLight ? 13000 : 13000;
      window.setTimeout(() => setElements([]), maxDur);
    },
    [],
  );

  useEffect(() => {
    if (active) spawn(light);
  }, [active, light, spawn]);

  return (
    <div className="aw-celebration-layer" ref={containerRef as React.RefObject<HTMLDivElement>}>
      {elements}
    </div>
  );
});

export function useSpawnCelebration() {
  const [key, setKey] = useState(0);
  const [light, setLight] = useState(false);

  const spawnCelebration = useCallback((isLight = false) => {
    setLight(isLight);
    setKey((k) => k + 1);
  }, []);

  return { celebrationKey: key, celebrationLight: light, spawnCelebration };
}

export function spawnFireflies(container: HTMLElement) {
  for (let k = 0; k < 14; k++) {
    const f = document.createElement('div');
    f.className = 'aw-firefly';
    f.style.left = `${Math.random() * 100}%`;
    f.style.top = `${20 + Math.random() * 70}%`;
    f.style.animation = `awTwinkle ${2 + Math.random() * 2}s ease-in-out infinite`;
    f.style.animationDelay = `${Math.random() * 2}s`;
    f.style.opacity = '0.8';
    container.appendChild(f);
  }
}
