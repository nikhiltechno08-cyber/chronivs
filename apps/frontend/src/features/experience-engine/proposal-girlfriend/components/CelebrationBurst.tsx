'use client';

import { memo, useEffect, useRef } from 'react';

import { useReducedMotion } from '@/animations/hooks/use-reduced-motion';

type CelebrationBurstProps = {
  active?: boolean;
  containerRef?: React.RefObject<HTMLElement | null>;
};

const CONFETTI_COLORS = ['var(--champagne)', 'var(--rose-gold)', 'var(--gold-light)', 'var(--moonlight)'];

export const CelebrationBurst = memo(function CelebrationBurst({
  active = false,
  containerRef,
}: CelebrationBurstProps) {
  const prefersReducedMotion = useReducedMotion();
  const spawnedRef = useRef(false);

  useEffect(() => {
    if (!active || prefersReducedMotion || spawnedRef.current) return;
    spawnedRef.current = true;

    const container = containerRef?.current ?? document.querySelector('.prop-stage');
    if (!container) return;

    const elements: HTMLElement[] = [];

    for (let i = 0; i < 50; i++) {
      const c = document.createElement('div');
      c.className = 'prop-confetti';
      c.style.left = `${Math.random() * 100}%`;
      c.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length]!;
      c.style.animationDuration = `${2.5 + Math.random() * 2}s`;
      c.style.animationDelay = `${Math.random() * 0.6}s`;
      container.appendChild(c);
      elements.push(c);
      window.setTimeout(() => c.remove(), 5000);
    }

    for (let i = 0; i < 18; i++) {
      const h = document.createElement('div');
      h.className = 'prop-hearts-abundant';
      h.style.left = `${Math.random() * 100}%`;
      h.style.animationDuration = `${4 + Math.random() * 3}s`;
      h.style.animationDelay = `${Math.random() * 1.2}s`;
      container.appendChild(h);
      elements.push(h);
      window.setTimeout(() => h.remove(), 8000);
    }

    return () => {
      elements.forEach((el) => el.remove());
    };
  }, [active, prefersReducedMotion, containerRef]);

  useEffect(() => {
    if (!active) spawnedRef.current = false;
  }, [active]);

  return null;
});
