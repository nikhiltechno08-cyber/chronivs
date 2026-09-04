export const duration = {
  instant: 'var(--chronivs-duration-instant)',
  fast: 'var(--chronivs-duration-fast)',
  normal: 'var(--chronivs-duration-normal)',
  slow: 'var(--chronivs-duration-slow)',
  slower: 'var(--chronivs-duration-slower)',
  cinematic: 'var(--chronivs-duration-cinematic)',
} as const;

export const easing = {
  linear: 'var(--chronivs-ease-linear)',
  in: 'var(--chronivs-ease-in)',
  out: 'var(--chronivs-ease-out)',
  inOut: 'var(--chronivs-ease-in-out)',
  spring: 'var(--chronivs-ease-spring)',
  cinematic: 'var(--chronivs-ease-cinematic)',
} as const;

export type DurationToken = typeof duration;
export type EasingToken = typeof easing;
