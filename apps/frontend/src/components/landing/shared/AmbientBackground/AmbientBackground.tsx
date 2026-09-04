'use client';

import { useEffect, useRef } from 'react';

import { useReducedMotion } from '@/animations/hooks/use-reduced-motion';

type Particle = {
  x: number;
  y: number;
  r: number;
  s: number;
  o: number;
  drift: number;
};

export function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let particles: Particle[] = [];
    let frameId = 0;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = Math.max(document.body.scrollHeight, window.innerHeight);
      const count = Math.min(70, Math.floor(W / 22));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.6 + 0.4,
        s: Math.random() * 0.3 + 0.05,
        o: Math.random() * 0.5 + 0.15,
        drift: Math.random() * 0.4 - 0.2,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        p.y -= p.s;
        p.x += p.drift * 0.2;
        if (p.y < -10) {
          p.y = H + 10;
          p.x = Math.random() * W;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(205,164,94,${p.o})`;
        ctx.fill();
      });
      frameId = requestAnimationFrame(draw);
    };

    resize();
    draw();

    const onResize = () => resize();
    window.addEventListener('resize', onResize);
    const lateResize = setTimeout(resize, 800);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      clearTimeout(lateResize);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] h-full w-full opacity-[0.55]"
    />
  );
}
