'use client';

import { memo, useEffect, useMemo, useRef, type CSSProperties } from 'react';

import { useReducedMotion } from '@/animations/hooks/use-reduced-motion';
import { isLightChrome } from '../constants/story';

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

type AmbientItem = {
  id: string;
  className: string;
  style: CSSProperties;
  minPhase: number;
};

type AmbientWorldProps = {
  worldPhase: number;
};

export const AmbientWorld = memo(function AmbientWorld({ worldPhase }: AmbientWorldProps) {
  const prefersReducedMotion = useReducedMotion();
  const isSmall = typeof window !== 'undefined' ? window.innerWidth < 640 : false;
  const light = isLightChrome(worldPhase);

  const items = useMemo<AmbientItem[]>(() => {
    const list: AmbientItem[] = [];
    const dustCount = isSmall ? 18 : 36;
    for (let i = 0; i < dustCount; i++) {
      const size = rand(1.2, 2.8);
      list.push({
        id: `dust-${i}`,
        className: 'fb-dust',
        minPhase: 1,
        style: {
          width: size,
          height: size,
          left: `${rand(0, 100)}%`,
          top: `${rand(0, 100)}%`,
          animationDuration: `${rand(3.2, 6.4)}s`,
          animationDelay: `${rand(0, 4)}s`,
        },
      });
    }
    for (let i = 0; i < (isSmall ? 2 : 4); i++) {
      list.push({
        id: `bird-${i}`,
        className: 'fb-bird',
        minPhase: 1,
        style: {
          left: `${15 + i * 22}%`,
          top: `${18 + (i % 2) * 10}%`,
          animationDelay: `${i * 1.4}s`,
          animationDuration: `${14 + i * 2}s`,
        },
      });
    }
    return list;
  }, [isSmall]);

  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const el = parallaxRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 6;
      const y = (e.clientY / window.innerHeight - 0.5) * 4;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [prefersReducedMotion]);

  const themeClass = light ? 'theme-light' : worldPhase === 6 ? 'theme-dusk' : 'theme-night';

  return (
    <>
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={`bg-${i + 1}`}
          className={`fb-bg fb-bg-${i + 1} ${worldPhase === i + 1 ? 'active' : ''}`}
          aria-hidden="true"
        />
      ))}
      <div className={`fb-mountains ${light && worldPhase <= 2 ? 'on' : ''}`} aria-hidden="true" />
      <div className={`fb-rays ${worldPhase === 10 || worldPhase === 9 ? 'on' : ''}`} aria-hidden="true" />
      <div id="fb-world" ref={parallaxRef} className={themeClass} aria-hidden="true">
        {!prefersReducedMotion &&
          items.map((item) => (
            <div
              key={item.id}
              className={`${item.className} ${worldPhase >= item.minPhase ? 'on' : ''}`}
              style={item.style}
            />
          ))}
      </div>
      <div className={`fb-vignette ${light ? 'light' : ''}`} aria-hidden="true" />
      <div className="fb-grain" aria-hidden="true" />
      <div className="fb-brand">Chronivs</div>
    </>
  );
});
