'use client';

import { memo, useEffect, useRef } from 'react';

import { useReducedMotion } from '@/animations/hooks/use-reduced-motion';
import { PARTICLE_COLORS, PARTICLE_COUNTS, SCENE_PARTICLES } from '../constants/story';
import type { ParticleType } from '../types';

type Particle = {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  rot: number;
  rotSpeed: number;
  sway: number;
  swaySpeed: number;
  alpha: number;
  color: string;
  type: ParticleType;
};

function particleScale(): number {
  if (typeof window === 'undefined') return 1;
  const w = window.innerWidth;
  if (w < 480) return 0.55;
  if (w < 768) return 0.75;
  return 1;
}

function seedParticles(type: ParticleType, count: number, color: string, w: number, h: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r:
        type === 'bokeh'
          ? 14 + Math.random() * 26
          : type === 'petal'
            ? 5 + Math.random() * 4
            : 1 + Math.random() * 2.6,
      vy: type === 'star' ? 0 : 0.12 + Math.random() * 0.3,
      vx: (Math.random() - 0.5) * 0.35,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.004 + Math.random() * 0.01,
      alpha: type === 'bokeh' ? 0.08 + Math.random() * 0.1 : 0.3 + Math.random() * 0.5,
      color,
      type,
    });
  }
  return particles;
}

type ParticleCanvasProps = {
  sceneIndex: number;
};

export const ParticleCanvas = memo(function ParticleCanvas({ sceneIndex }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef(0);
  const sceneRef = useRef(sceneIndex);
  const runningRef = useRef(true);
  const prefersReducedMotion = useReducedMotion();

  sceneRef.current = sceneIndex;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prefersReducedMotion) return;

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      reseed(sceneRef.current, w, h);
    };

    const reseed = (index: number, w: number, h: number) => {
      const type = SCENE_PARTICLES[index] ?? 'petal';
      const color = PARTICLE_COLORS[type];
      const base = PARTICLE_COUNTS[type];
      const count = Math.max(6, Math.round(base * particleScale()));
      particlesRef.current = seedParticles(type, count, color, w, h);
    };

    const onVisibility = () => {
      runningRef.current = document.visibilityState === 'visible';
      if (runningRef.current && !rafRef.current) {
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    let lastTs = 0;
    const FRAME_MS = 1000 / 45; // cap ~45fps — looks smooth, costs less than 60

    const draw = (ts: number) => {
      rafRef.current = 0;
      if (!runningRef.current) return;

      if (ts - lastTs < FRAME_MS) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }
      lastTs = ts;

      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const list = particlesRef.current;
      for (let i = 0; i < list.length; i++) {
        const p = list[i]!;
        p.sway += p.swaySpeed;
        p.rot += p.rotSpeed;
        p.x += p.vx + Math.sin(p.sway) * 0.4;
        p.y -= p.vy;
        if (p.type === 'firefly') {
          p.alpha = 0.25 + 0.45 * Math.sin(p.sway * 3);
        }
        if (p.y < -30) {
          p.y = h + 30;
          p.x = Math.random() * w;
        }
        if (p.x < -30) p.x = w + 30;
        if (p.x > w + 30) p.x = -30;

        if (p.type === 'petal') {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.r, p.r * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (p.type === 'bokeh') {
          // Soft disc without per-frame gradient allocation
          ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(${p.color},${p.alpha * 0.45})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 1.55, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    runningRef.current = document.visibilityState === 'visible';
    resize();
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [prefersReducedMotion]);

  // Reseed on scene change without tearing down the RAF loop
  useEffect(() => {
    if (prefersReducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    reseedSafe(sceneIndex, canvas);

    function reseedSafe(index: number, el: HTMLCanvasElement) {
      const type = SCENE_PARTICLES[index] ?? 'petal';
      const color = PARTICLE_COLORS[type];
      const base = PARTICLE_COUNTS[type];
      const count = Math.max(6, Math.round(base * particleScale()));
      particlesRef.current = seedParticles(type, count, color, window.innerWidth, window.innerHeight);
      void el;
    }
  }, [sceneIndex, prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return <canvas ref={canvasRef} className="aw-fx-canvas" aria-hidden="true" />;
});
