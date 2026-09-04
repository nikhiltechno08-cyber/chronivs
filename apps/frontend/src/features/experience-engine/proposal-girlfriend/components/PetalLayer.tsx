'use client';

import { memo, useEffect, useState } from 'react';

import { useReducedMotion } from '@/animations/hooks/use-reduced-motion';

type PetalStyle = {
  left: string;
  drift: string;
  duration: string;
  delay: string;
};

function buildPetals(quiet = false): PetalStyle[] {
  const base = typeof window !== 'undefined' && window.innerWidth < 640 ? 8 : 14;
  const count = quiet ? Math.max(4, Math.round(base * 0.45)) : base;
  return Array.from({ length: count }, () => ({
    left: `${Math.random() * 100}%`,
    drift: `${Math.random() * 140 - 70}px`,
    duration: `${(quiet ? 20 : 14) + Math.random() * (quiet ? 14 : 10)}s`,
    delay: `${Math.random() * 14}s`,
  }));
}

type PetalLayerProps = {
  quiet?: boolean;
};

export const PetalLayer = memo(function PetalLayer({ quiet = false }: PetalLayerProps) {
  const prefersReducedMotion = useReducedMotion();
  const [petals, setPetals] = useState<PetalStyle[]>([]);

  useEffect(() => {
    if (!prefersReducedMotion) {
      setPetals(buildPetals(quiet));
    }
  }, [prefersReducedMotion, quiet]);

  if (prefersReducedMotion || petals.length === 0) return null;

  return (
    <div className={`prop-petals${quiet ? ' quiet' : ''}`} aria-hidden="true">
      {petals.map((p, i) => (
        <div
          key={i}
          className="prop-petal"
          style={{
            left: p.left,
            ['--drift' as string]: p.drift,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
});
