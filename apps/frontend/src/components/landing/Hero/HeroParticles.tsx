/** Fixed particle field — deterministic for SSR/hydration (no runtime random). */
const HERO_PARTICLES = [
  { depth: 'near', x: 72, y: 18, size: 8, dx: 8, dy: -16, duration: 18, delay: 0.2, opMin: 0.08, opMax: 0.18 },
  { depth: 'near', x: 84, y: 42, size: 7, dx: -10, dy: 12, duration: 20, delay: 2.4, opMin: 0.07, opMax: 0.16 },
  { depth: 'near', x: 58, y: 62, size: 8, dx: 6, dy: 18, duration: 17, delay: 4.1, opMin: 0.09, opMax: 0.2 },
  { depth: 'near', x: 91, y: 28, size: 6, dx: -8, dy: -14, duration: 19, delay: 1.3, opMin: 0.06, opMax: 0.15 },
  { depth: 'near', x: 66, y: 78, size: 7, dx: 10, dy: 8, duration: 16, delay: 5.6, opMin: 0.08, opMax: 0.17 },
  { depth: 'near', x: 78, y: 55, size: 8, dx: -6, dy: 20, duration: 20, delay: 3.2, opMin: 0.07, opMax: 0.18 },
  { depth: 'near', x: 48, y: 34, size: 6, dx: 9, dy: -10, duration: 18, delay: 6.8, opMin: 0.05, opMax: 0.14 },
  { depth: 'near', x: 88, y: 68, size: 7, dx: -9, dy: 14, duration: 17, delay: 0.9, opMin: 0.08, opMax: 0.19 },
  { depth: 'near', x: 54, y: 48, size: 8, dx: 7, dy: -18, duration: 19, delay: 7.2, opMin: 0.06, opMax: 0.16 },
  { depth: 'near', x: 95, y: 52, size: 6, dx: -7, dy: 16, duration: 16, delay: 2.8, opMin: 0.07, opMax: 0.15 },
  { depth: 'mid', x: 38, y: 22, size: 5, dx: -8, dy: 12, duration: 14, delay: 1.1, opMin: 0.08, opMax: 0.2 },
  { depth: 'mid', x: 62, y: 12, size: 4, dx: 10, dy: -14, duration: 13, delay: 3.5, opMin: 0.06, opMax: 0.17 },
  { depth: 'mid', x: 44, y: 58, size: 6, dx: -6, dy: 18, duration: 15, delay: 0.4, opMin: 0.09, opMax: 0.22 },
  { depth: 'mid', x: 82, y: 38, size: 5, dx: 8, dy: -8, duration: 12, delay: 4.7, opMin: 0.07, opMax: 0.18 },
  { depth: 'mid', x: 28, y: 44, size: 4, dx: -10, dy: 10, duration: 14, delay: 6.2, opMin: 0.05, opMax: 0.15 },
  { depth: 'mid', x: 70, y: 72, size: 5, dx: 6, dy: -16, duration: 13, delay: 2.1, opMin: 0.08, opMax: 0.19 },
  { depth: 'mid', x: 52, y: 86, size: 4, dx: -7, dy: 12, duration: 15, delay: 5.3, opMin: 0.06, opMax: 0.16 },
  { depth: 'mid', x: 76, y: 8, size: 6, dx: 9, dy: 20, duration: 12, delay: 7.6, opMin: 0.07, opMax: 0.21 },
  { depth: 'mid', x: 34, y: 74, size: 5, dx: -9, dy: -12, duration: 14, delay: 1.8, opMin: 0.08, opMax: 0.18 },
  { depth: 'mid', x: 60, y: 32, size: 4, dx: 7, dy: 14, duration: 13, delay: 3.9, opMin: 0.05, opMax: 0.14 },
  { depth: 'mid', x: 86, y: 82, size: 5, dx: -8, dy: -10, duration: 15, delay: 0.7, opMin: 0.09, opMax: 0.2 },
  { depth: 'mid', x: 42, y: 8, size: 4, dx: 10, dy: 8, duration: 12, delay: 4.4, opMin: 0.06, opMax: 0.17 },
  { depth: 'far', x: 18, y: 28, size: 3, dx: -6, dy: -8, duration: 11, delay: 2.6, opMin: 0.05, opMax: 0.12 },
  { depth: 'far', x: 32, y: 52, size: 2, dx: 8, dy: 10, duration: 10, delay: 5.1, opMin: 0.05, opMax: 0.11 },
  { depth: 'far', x: 22, y: 68, size: 3, dx: -7, dy: 14, duration: 12, delay: 0.3, opMin: 0.06, opMax: 0.13 },
  { depth: 'far', x: 46, y: 14, size: 2, dx: 6, dy: -12, duration: 10, delay: 3.8, opMin: 0.05, opMax: 0.1 },
  { depth: 'far', x: 14, y: 46, size: 3, dx: -5, dy: 8, duration: 11, delay: 6.5, opMin: 0.05, opMax: 0.12 },
  { depth: 'far', x: 36, y: 88, size: 2, dx: 7, dy: -6, duration: 10, delay: 1.5, opMin: 0.05, opMax: 0.11 },
  { depth: 'far', x: 8, y: 62, size: 3, dx: -8, dy: 16, duration: 12, delay: 4.2, opMin: 0.06, opMax: 0.13 },
  { depth: 'far', x: 26, y: 12, size: 2, dx: 5, dy: -14, duration: 11, delay: 7.4, opMin: 0.05, opMax: 0.1 },
  { depth: 'far', x: 50, y: 6, size: 3, dx: -6, dy: 10, duration: 10, delay: 2.2, opMin: 0.05, opMax: 0.12 },
  { depth: 'far', x: 12, y: 82, size: 2, dx: 8, dy: -10, duration: 11, delay: 5.9, opMin: 0.05, opMax: 0.11 },
] as const;

export function HeroParticles() {
  return (
    <div className="landing-hero-particles" aria-hidden="true">
      {HERO_PARTICLES.map((p, i) => (
        <span
          key={i}
          className={`landing-hero-particle landing-hero-particle--${p.depth}`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            ['--hero-dx' as string]: `${p.dx}px`,
            ['--hero-dy' as string]: `${p.dy}px`,
            ['--hero-dur' as string]: `${p.duration}s`,
            ['--hero-delay' as string]: `${p.delay}s`,
            ['--hero-op-min' as string]: String(p.opMin),
            ['--hero-op-max' as string]: String(p.opMax),
          }}
        />
      ))}
    </div>
  );
}
