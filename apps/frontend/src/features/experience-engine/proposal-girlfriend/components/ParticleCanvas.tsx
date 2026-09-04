'use client';

import { memo, useEffect, useRef } from 'react';

import { useReducedMotion } from '@/animations/hooks/use-reduced-motion';

type Particle = {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  a: number;
  tw: number;
  gold: boolean;
};

function particleCount(): number {
  if (typeof window === 'undefined') return 0;
  return window.innerWidth < 640 ? 26 : 46;
}

type ParticleCanvasProps = {
  quiet?: boolean;
};

export const ParticleCanvas = memo(function ParticleCanvas({ quiet = false }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef(0);
  const quietRef = useRef(quiet);
  const prefersReducedMotion = useReducedMotion();

  quietRef.current = quiet;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0;
    let H = 0;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      const count = particleCount();
      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.8 + 0.6,
        vy: -(Math.random() * 0.25 + 0.05),
        vx: (Math.random() - 0.5) * 0.15,
        a: Math.random() * 0.6 + 0.2,
        tw: Math.random() * Math.PI * 2,
        gold: Math.random() > 0.5,
      }));
    };

    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      particlesRef.current.forEach((p) => {
        p.tw += 0.02;
        const alpha = p.a * (0.6 + 0.4 * Math.sin(p.tw));
        ctx.beginPath();
        ctx.fillStyle = p.gold ? `rgba(255,227,163,${alpha})` : `rgba(201,214,236,${alpha})`;
        ctx.shadowColor = p.gold ? 'rgba(255,227,163,0.8)' : 'rgba(201,214,236,0.6)';
        ctx.shadowBlur = 6;
        ctx.arc(p.x, p.y, p.r * 2, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.vx * (quietRef.current ? 0.42 : 1);
        p.y += p.vy * (quietRef.current ? 0.42 : 1);
        if (p.y < -10) {
          p.y = H + 10;
          p.x = Math.random() * W;
        }
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
      });
      rafRef.current = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener('resize', resize);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return <canvas ref={canvasRef} className="prop-particles" aria-hidden="true" />;
});
