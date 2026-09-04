/** About hero particle field — deterministic for SSR/hydration. */
const ABOUT_PARTICLES = [
  { depth: 'near', x: 18, y: 22, size: 7, dx: 6, dy: -12, duration: 17, delay: 0.4, opMin: 0.07, opMax: 0.16 },
  { depth: 'near', x: 82, y: 18, size: 8, dx: -8, dy: 14, duration: 19, delay: 2.1, opMin: 0.08, opMax: 0.18 },
  { depth: 'near', x: 64, y: 72, size: 6, dx: 10, dy: -8, duration: 16, delay: 4.5, opMin: 0.06, opMax: 0.15 },
  { depth: 'mid', x: 42, y: 38, size: 5, dx: -7, dy: 16, duration: 14, delay: 1.2, opMin: 0.07, opMax: 0.19 },
  { depth: 'mid', x: 76, y: 52, size: 4, dx: 8, dy: -10, duration: 13, delay: 3.6, opMin: 0.05, opMax: 0.16 },
  { depth: 'mid', x: 28, y: 68, size: 5, dx: -6, dy: 12, duration: 15, delay: 5.8, opMin: 0.08, opMax: 0.17 },
  { depth: 'far', x: 12, y: 44, size: 3, dx: 5, dy: -8, duration: 11, delay: 0.8, opMin: 0.05, opMax: 0.12 },
  { depth: 'far', x: 92, y: 36, size: 2, dx: -5, dy: 10, duration: 10, delay: 2.9, opMin: 0.05, opMax: 0.11 },
  { depth: 'far', x: 54, y: 12, size: 3, dx: 7, dy: 14, duration: 12, delay: 4.2, opMin: 0.06, opMax: 0.13 },
] as const;

export function AboutParticles() {
  return (
    <div className="about-hero-particles" aria-hidden="true">
      {ABOUT_PARTICLES.map((p, i) => (
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
