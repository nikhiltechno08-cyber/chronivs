'use client';

const GLASS_GLOWS = [
  {
    id: 'glow-1',
    className: 'landing-hero-glass-glow--one',
    duration: 26,
    delay: 0,
  },
  {
    id: 'glow-2',
    className: 'landing-hero-glass-glow--two',
    duration: 22,
    delay: 4,
  },
  {
    id: 'glow-3',
    className: 'landing-hero-glass-glow--three',
    duration: 30,
    delay: 8,
  },
] as const;

export function HeroGlassGlow() {
  return (
    <div className="landing-hero-glass" aria-hidden="true">
      {GLASS_GLOWS.map((glow) => (
        <div
          key={glow.id}
          className={`landing-hero-glass-glow ${glow.className}`}
          style={{
            ['--hero-glass-dur' as string]: `${glow.duration}s`,
            ['--hero-glass-delay' as string]: `${glow.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
