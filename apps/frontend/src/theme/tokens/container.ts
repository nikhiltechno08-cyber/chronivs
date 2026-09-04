export const containerWidths = {
  xs: 'var(--container-xs)',
  sm: 'var(--container-sm)',
  md: 'var(--container-md)',
  lg: 'var(--container-lg)',
  xl: 'var(--container-xl)',
  '2xl': 'var(--container-2xl)',
  full: 'var(--container-full)',
} as const;

export type ContainerWidthToken = typeof containerWidths;
