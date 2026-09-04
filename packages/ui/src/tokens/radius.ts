export const radius = {
  sm: 'var(--chronivs-radius-sm)',
  md: 'var(--chronivs-radius-md)',
  lg: 'var(--chronivs-radius-lg)',
  xl: 'var(--chronivs-radius-xl)',
  pill: 'var(--chronivs-radius-pill)',
} as const;

export type RadiusToken = typeof radius;
