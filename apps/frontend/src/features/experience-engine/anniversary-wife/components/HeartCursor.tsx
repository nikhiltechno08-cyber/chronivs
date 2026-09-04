'use client';

import { memo, useEffect, useRef } from 'react';

export const HeartCursor = memo(function HeartCursor() {
  const heartRef = useRef<HTMLDivElement>(null);
  const lastHeart = useRef(0);
  const timeoutRef = useRef<number>(0);

  useEffect(() => {
    const hc = heartRef.current;
    if (!hc) return;

    const finePointer = window.matchMedia('(pointer: fine)').matches;

    const onMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastHeart.current > 260) {
        lastHeart.current = now;
        hc.style.left = `${e.clientX - 7}px`;
        hc.style.top = `${e.clientY - 7}px`;
        hc.style.opacity = '0.5';
        clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => {
          hc.style.opacity = '0';
        }, 280);
      }
    };

    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      const r = document.createElement('div');
      r.style.cssText =
        'position:fixed;width:20px;height:20px;border-radius:50%;border:1px solid rgba(123,45,62,0.5);pointer-events:none;z-index:199;transition:all .6s ease';
      r.style.left = `${t.clientX - 10}px`;
      r.style.top = `${t.clientY - 10}px`;
      document.body.appendChild(r);
      requestAnimationFrame(() => {
        r.style.transform = 'scale(2.6)';
        r.style.opacity = '0';
      });
      window.setTimeout(() => r.remove(), 650);
    };

    if (finePointer) {
      window.addEventListener('mousemove', onMove, { passive: true });
    }
    window.addEventListener('touchstart', onTouch, { passive: true });
    return () => {
      if (finePointer) window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchstart', onTouch);
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div ref={heartRef} className="aw-heart-cursor" aria-hidden="true">
      ❤
    </div>
  );
});
