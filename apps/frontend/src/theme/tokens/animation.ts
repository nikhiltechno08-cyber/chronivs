export const animationDurations = {
  instant: 'var(--duration-instant)',
  fast: 'var(--duration-fast)',
  normal: 'var(--duration-normal)',
  slow: 'var(--duration-slow)',
  slower: 'var(--duration-slower)',
} as const;

export const animationEasings = {
  linear: 'var(--ease-linear)',
  in: 'var(--ease-in)',
  out: 'var(--ease-out)',
  inOut: 'var(--ease-in-out)',
  spring: 'var(--ease-spring)',
  cinematic: 'var(--ease-cinematic)',
} as const;

export type AnimationDurationToken = typeof animationDurations;
export type AnimationEasingToken = typeof animationEasings;
