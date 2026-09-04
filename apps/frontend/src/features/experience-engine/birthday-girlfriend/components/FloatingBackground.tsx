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
  content?: string;
};

type FloatingBackgroundProps = {
  worldPhase: number;
};

export const FloatingBackground = memo(function FloatingBackground({ worldPhase }: FloatingBackgroundProps) {
  const prefersReducedMotion = useReducedMotion();
  const worldRef = useRef<HTMLDivElement>(null);
  const isSmall = typeof window !== 'undefined' ? window.innerWidth < 640 : false;

  const ambientItems = useMemo<AmbientItem[]>(() => {
    const items: AmbientItem[] = [];
    const starCount = isSmall ? 18 : 30;

    for (let i = 0; i < starCount; i++) {
      const size = rand(1.2, 2.6);
      items.push({
        id: `star-${i}`,
        className: 'star-dot',
        minPhase: i < starCount * 0.4 ? 1 : 2,
        style: {
          width: size,
          height: size,
          left: `${rand(0, 100)}%`,
          top: `${rand(0, 55)}%`,
          animationDuration: `${rand(2, 4.5)}s`,
          animationDelay: `${rand(0, 4)}s`,
        },
      });
    }

    const bokehCount = isSmall ? 4 : 7;
    for (let i = 0; i < bokehCount; i++) {
      const size = 80 + Math.random() * 140;
      items.push({
        id: `bokeh-${i}`,
        className: 'bokeh',
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

    const baseHearts = isSmall ? 4 : 7;
    for (let i = 0; i < baseHearts; i++) {
      items.push({
        id: `heart-base-${i}`,
        className: 'heart-float',
        minPhase: 1,
        content: '❤',
        style: {
          left: `${Math.random() * 100}%`,
          bottom: '-20px',
          animationDuration: `${12 + Math.random() * 10}s`,
          animationDelay: `${Math.random() * 14}s`,
        },
      });
    }

    const extraHearts = isSmall ? 5 : 9;
    for (let i = 0; i < extraHearts; i++) {
      items.push({
        id: `heart-extra-${i}`,
        className: 'heart-float',
        minPhase: 4,
        content: '❤',
        style: {
          left: `${Math.random() * 100}%`,
          bottom: '-20px',
          animationDuration: `${11 + Math.random() * 9}s`,
          animationDelay: `${Math.random() * 12}s`,
        },
      });
    }

    const petalCount = isSmall ? 6 : 12;
    for (let i = 0; i < petalCount; i++) {
      items.push({
        id: `petal-${i}`,
        className: 'petal',
        minPhase: 5,
        style: {
          left: `${Math.random() * 100}%`,
          animationDuration: `${9 + Math.random() * 8}s`,
          animationDelay: `${Math.random() * 10}s`,
        },
      });
    }

    const sparkCount = isSmall ? 10 : 18;
    for (let i = 0; i < sparkCount; i++) {
      items.push({
        id: `spark-${i}`,
        className: 'spark-dust',
        minPhase: 6,
        style: {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 90}%`,
          animationDuration: `${1.6 + Math.random() * 2.4}s`,
          animationDelay: `${Math.random() * 3}s`,
        },
      });
    }

    const fireflyCount = isSmall ? 8 : 14;
    for (let i = 0; i < fireflyCount; i++) {
      items.push({
        id: `firefly-${i}`,
        className: 'firefly',
        minPhase: 8,
        style: {
          left: `${rand(10, 90)}%`,
          top: `${rand(40, 90)}%`,
          animationDuration: `${rand(6, 10)}s, ${rand(2, 3.4)}s`,
          animationDelay: `${rand(0, 6)}s, ${rand(0, 3)}s`,
        },
      });
    }

    const balloonColors = ['var(--rose-gold)', 'var(--soft-gold)', 'var(--pink)'];
    for (let i = 0; i < 3; i++) {
      const w = rand(14, 20);
      items.push({
        id: `balloon-${i}`,
        className: 'balloon-ambient',
        minPhase: 1,
        style: {
          width: w,
          height: w * 1.25,
          left: `${rand(10, 85)}%`,
          bottom: `${rand(-30, -5)}%`,
          background: balloonColors[i % 3],
          opacity: 0.5,
        },
      });
    }

    const starIconCount = isSmall ? 3 : 5;
    for (let i = 0; i < starIconCount; i++) {
      items.push({
        id: `icon-star-${i}`,
        className: 'icon-star-float',
        minPhase: 1,
        content: '✦',
        style: {
          left: `${Math.random() * 100}%`,
          bottom: '-20px',
          animationDuration: `${13 + Math.random() * 10}s`,
          animationDelay: `${Math.random() * 14}s`,
        },
      });
    }

    const balloonIconCount = isSmall ? 2 : 4;
    for (let i = 0; i < balloonIconCount; i++) {
      items.push({
        id: `icon-balloon-${i}`,
        className: 'icon-balloon-float',
        minPhase: 1,
        content: '🎈',
        style: {
          left: `${Math.random() * 100}%`,
          bottom: '-20px',
          animationDuration: `${16 + Math.random() * 10}s`,
          animationDelay: `${Math.random() * 16}s`,
        },
      });
    }

    const ribbonCount = isSmall ? 2 : 4;
    for (let i = 0; i < ribbonCount; i++) {
      items.push({
        id: `ribbon-${i}`,
        className: 'icon-ribbon-float',
        minPhase: 1,
        style: {
          left: `${Math.random() * 100}%`,
          bottom: '-60px',
          animationDuration: `${14 + Math.random() * 9}s`,
          animationDelay: `${Math.random() * 14}s`,
        },
      });
    }

    return items;
  }, [isSmall]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (!window.matchMedia('(pointer:fine)').matches) return;

    const world = worldRef.current;
    const onMove = (e: MouseEvent) => {
      if (!world) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 14;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      world.style.transform = `translate(${x}px, ${y}px)`;
    };

    let lastTrail = 0;
    const onTrail = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastTrail < 55) return;
      lastTrail = now;
      const h = document.createElement('div');
      h.className = 'cursor-heart';
      h.textContent = '❤';
      h.style.left = `${e.clientX}px`;
      h.style.top = `${e.clientY}px`;
      document.body.appendChild(h);
      requestAnimationFrame(() => h.classList.add('go'));
      window.setTimeout(() => h.remove(), 950);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousemove', onTrail);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousemove', onTrail);
    };
  }, [prefersReducedMotion]);

  const moonGlow = 8 + Math.min(worldPhase, 8) * 3;
  const moonShadow = `0 0 ${moonGlow}px ${6 + worldPhase}px rgba(230,197,139,${Math.min(0.6, 0.3 + worldPhase * 0.03)})`;

  return (
    <>
      <div id="world" ref={worldRef}>
        <div className="moon" id="moon" style={{ boxShadow: moonShadow }} />
        <div className="rays" id="rays" style={{ opacity: worldPhase >= 3 ? 1 : 0 }} />
      </div>
      <div id="ambient" aria-hidden="true">
        {ambientItems.map((item) => (
          <div
            key={item.id}
            className={item.className}
            style={{
              ...item.style,
              opacity: worldPhase >= item.minPhase ? undefined : 0,
            }}
          >
            {item.content}
          </div>
        ))}
      </div>
    </>
  );
});

export const FloatingHearts = FloatingBackground;
export const FloatingParticles = FloatingBackground;
