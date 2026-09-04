'use client';

import { memo, useEffect, useMemo, useRef } from 'react';

import { useReducedMotion } from '@/animations/hooks/use-reduced-motion';

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

type AmbientItem = {
  id: string;
  className: string;
  style: React.CSSProperties;
  minPhase: number;
};

type AmbientWorldProps = {
  worldPhase: number;
};

export const AmbientWorld = memo(function AmbientWorld({ worldPhase }: AmbientWorldProps) {
  const prefersReducedMotion = useReducedMotion();
  const isSmall = typeof window !== 'undefined' ? window.innerWidth < 640 : false;

  const items = useMemo<AmbientItem[]>(() => {
    const list: AmbientItem[] = [];
    const starCount = isSmall ? 16 : 28;
    for (let i = 0; i < starCount; i++) {
      const size = rand(1.2, 2.8);
      list.push({
        id: `star-${i}`,
        className: 'mb-star',
        minPhase: 5,
        style: {
          width: size,
          height: size,
          left: `${rand(0, 100)}%`,
          top: `${rand(0, 50)}%`,
          animationDuration: `${rand(2.4, 4.8)}s`,
          animationDelay: `${rand(0, 3)}s`,
        },
      });
    }

    const bokehCount = isSmall ? 4 : 7;
    for (let i = 0; i < bokehCount; i++) {
      const size = 70 + Math.random() * 130;
      list.push({
        id: `bokeh-${i}`,
        className: 'mb-bokeh',
        minPhase: 1,
        style: {
          width: size,
          height: size,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDuration: `${8 + Math.random() * 10}s`,
        },
      });
    }

    const petalCount = isSmall ? 8 : 14;
    for (let i = 0; i < petalCount; i++) {
      list.push({
        id: `petal-${i}`,
        className: 'mb-petal',
        minPhase: 2,
        style: {
          left: `${Math.random() * 100}%`,
          top: `${-10 - Math.random() * 20}%`,
          animationDuration: `${10 + Math.random() * 12}s`,
          animationDelay: `${Math.random() * 10}s`,
        },
      });
    }

    const sparkCount = isSmall ? 8 : 14;
    for (let i = 0; i < sparkCount; i++) {
      list.push({
        id: `spark-${i}`,
        className: 'mb-spark',
        minPhase: 1,
        style: {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDuration: `${2 + Math.random() * 3}s`,
          animationDelay: `${Math.random() * 4}s`,
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
      const x = (e.clientX / window.innerWidth - 0.5) * 8;
      const y = (e.clientY / window.innerHeight - 0.5) * 6;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [prefersReducedMotion]);

  const themeClass =
    worldPhase <= 1 ? 'theme-dark' : worldPhase <= 5 ? 'theme-light' : 'theme-dark';

  return (
    <>
      {Array.from({ length: 7 }, (_, i) => (
        <div
          key={`bg-${i + 1}`}
          className={`mb-bg mb-bg-${i + 1} ${worldPhase === i + 1 ? 'active' : ''}`}
          aria-hidden="true"
        />
      ))}
      <div className={`mb-rays ${worldPhase >= 6 ? 'on' : ''}`} aria-hidden="true" />
      <div id="mb-world" ref={parallaxRef} className={themeClass} aria-hidden="true">
        {!prefersReducedMotion &&
          items.map((item) => (
            <div
              key={item.id}
              className={`${item.className} ${worldPhase >= item.minPhase ? 'on' : ''}`}
              style={item.style}
            />
          ))}
      </div>
      <div className="mb-vignette" aria-hidden="true" />
      <div className="mb-grain" aria-hidden="true" />
      <div className="mb-brand">Chronivs</div>
    </>
  );
});
