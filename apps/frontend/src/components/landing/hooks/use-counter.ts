'use client';

import { useEffect, useRef, useState } from 'react';

import { useReducedMotion } from '@/animations/hooks/use-reduced-motion';

type UseCounterOptions = {
  value?: number;
  decimal?: number;
  suffix?: string;
  duration?: number;
};

export function useCounter({ value, decimal, suffix = '', duration = 1600 }: UseCounterOptions) {
  const [display, setDisplay] = useState('0');
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  const rafRef = useRef(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || hasAnimated.current) return;
        hasAnimated.current = true;

        if (prefersReducedMotion) {
          if (value !== undefined) setDisplay(`${value.toLocaleString()}${suffix}`);
          else if (decimal !== undefined) setDisplay(`${decimal.toFixed(1)}${suffix}`);
          return;
        }

        const start = performance.now();
        const dur = decimal !== undefined ? 1200 : duration;

        const step = (t: number) => {
          const p = Math.min((t - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);

          if (value !== undefined) {
            setDisplay(`${Math.round(value * eased).toLocaleString()}${suffix}`);
          } else if (decimal !== undefined) {
            setDisplay(`${(decimal * eased).toFixed(1)}${suffix}`);
          }

          if (p < 1) {
            rafRef.current = requestAnimationFrame(step);
          }
        };

        rafRef.current = requestAnimationFrame(step);
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
    };
  }, [value, decimal, suffix, duration, prefersReducedMotion]);

  return { ref, display };
}
