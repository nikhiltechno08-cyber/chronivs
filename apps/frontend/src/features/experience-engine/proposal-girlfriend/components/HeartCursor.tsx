'use client';

import { memo, useEffect } from 'react';

import { useReducedMotion } from '@/animations/hooks/use-reduced-motion';

export const HeartCursor = memo(function HeartCursor() {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    let lastFx = 0;

    const onMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastFx < 140) return;
      lastFx = now;
      const h = document.createElement('div');
      h.className = 'prop-heart-fx';
      h.style.left = `${e.clientX}px`;
      h.style.top = `${e.clientY}px`;
      document.body.appendChild(h);
      window.setTimeout(() => h.remove(), 1200);
    };

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      const r = document.createElement('div');
      r.className = 'prop-ripple-fx';
      r.style.left = `${t.clientX}px`;
      r.style.top = `${t.clientY}px`;
      document.body.appendChild(r);
      window.setTimeout(() => r.remove(), 1000);
    };

    if (isFinePointer) {
      document.addEventListener('mousemove', onMouseMove);
    } else {
      document.addEventListener('touchstart', onTouchStart, { passive: true });
    }

    return () => {
      if (isFinePointer) {
        document.removeEventListener('mousemove', onMouseMove);
      } else {
        document.removeEventListener('touchstart', onTouchStart);
      }
    };
  }, [prefersReducedMotion]);

  return null;
});
