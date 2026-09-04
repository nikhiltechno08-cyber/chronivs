'use client';

import { memo, useMemo } from 'react';

import type { EndingAmbientConfig } from './messages';

type EndingAmbientProps = {
  config: EndingAmbientConfig;
  reducedMotion?: boolean;
};

function seededItems(count: number, seed: number) {
  return Array.from({ length: count }, (_, i) => {
    const n = ((seed + i * 17) % 97) / 97;
    const m = ((seed + i * 31) % 89) / 89;
    return {
      left: `${8 + n * 84}%`,
      delay: `${(m * 6).toFixed(2)}s`,
      duration: `${(10 + n * 10).toFixed(2)}s`,
      size: `${(0.55 + m * 0.7).toFixed(2)}rem`,
      opacity: (0.25 + n * 0.45).toFixed(2),
    };
  });
}

export const EndingAmbient = memo(function EndingAmbient({
  config,
  reducedMotion = false,
}: EndingAmbientProps) {
  const particles = useMemo(() => seededItems(28, 3), []);
  const hearts = useMemo(() => seededItems(10, 11), []);
  const petals = useMemo(() => seededItems(12, 23), []);
  const balloons = useMemo(() => seededItems(6, 41), []);
  const ribbons = useMemo(() => seededItems(5, 53), []);

  if (reducedMotion) {
    return <div className="cine-ending-ambient cine-ending-ambient--static" aria-hidden="true" />;
  }

  return (
    <div className="cine-ending-ambient" aria-hidden="true">
      <div className="cine-ending-glow" />
      <div className="cine-ending-rays" />

      {particles.map((p, i) => (
        <span
          key={`p-${i}`}
          className="cine-ending-particle"
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            width: p.size,
            height: p.size,
            opacity: Number(p.opacity),
          }}
        />
      ))}

      {config.hearts &&
        hearts.map((p, i) => (
          <span
            key={`h-${i}`}
            className="cine-ending-heart"
            style={{
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.duration,
              fontSize: p.size,
              opacity: Number(p.opacity),
            }}
          >
            ♥
          </span>
        ))}

      {config.petals &&
        petals.map((p, i) => (
          <span
            key={`petal-${i}`}
            className="cine-ending-petal"
            style={{
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.duration,
              opacity: Number(p.opacity),
            }}
          />
        ))}

      {config.balloons &&
        balloons.map((p, i) => (
          <span
            key={`b-${i}`}
            className="cine-ending-balloon"
            style={{
              left: p.left,
              animationDelay: p.delay,
              animationDuration: `${(16 + i * 2).toFixed(1)}s`,
              opacity: Number(p.opacity),
            }}
          >
            🎈
          </span>
        ))}

      {config.ribbons &&
        ribbons.map((p, i) => (
          <span
            key={`r-${i}`}
            className="cine-ending-ribbon"
            style={{
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.duration,
              opacity: Number(p.opacity) * 0.7,
            }}
          />
        ))}
    </div>
  );
});
