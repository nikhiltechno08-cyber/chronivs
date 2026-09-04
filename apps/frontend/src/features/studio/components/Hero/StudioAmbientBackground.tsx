'use client';

import { useEffect, useRef } from 'react';

import { useReducedMotion } from '@/animations/hooks/use-reduced-motion';

export function StudioAmbientBackground() {
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
    let particles: { x: number; y: number; r: number; s: number; o: number }[] = [];
    let frameId = 0;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      const count = Math.min(40, Math.floor(W / 40));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.3 + 0.3,
        s: Math.random() * 0.25 + 0.05,
        o: Math.random() * 0.4 + 0.1,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        p.y -= p.s;
        if (p.y < -5) {
          p.y = H + 5;
          p.x = Math.random() * W;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(230,193,90,${p.o})`;
        ctx.fill();
      });
      frameId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
    };
  }, [prefersReducedMotion]);

  return (
    <>
      {!prefersReducedMotion && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 opacity-50"
        />
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-[-10%] left-[15%] z-0 h-[600px] w-[600px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(230,193,90,.10), transparent 70%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed right-[10%] bottom-[-15%] z-0 h-[700px] w-[700px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(230,193,90,.07), transparent 70%)' }}
      />
    </>
  );
}
