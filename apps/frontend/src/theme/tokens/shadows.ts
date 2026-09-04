export const shadows = {
  none: 'var(--shadow-none)',
  sm: 'var(--shadow-sm)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
  xl: 'var(--shadow-xl)',
  inner: 'var(--shadow-inner)',
  glow: 'var(--shadow-glow)',
} as const;

export type ShadowToken = typeof shadows;
