export const elevation = {
  xs: 'var(--chronivs-shadow-xs)',
  sm: 'var(--chronivs-shadow-sm)',
  md: 'var(--chronivs-shadow-md)',
  lg: 'var(--chronivs-shadow-lg)',
  xl: 'var(--chronivs-shadow-xl)',
} as const;

export const blur = {
  sm: 'var(--chronivs-blur-sm)',
  md: 'var(--chronivs-blur-md)',
  lg: 'var(--chronivs-blur-lg)',
  glass: 'var(--chronivs-blur-glass)',
} as const;

export const glass = {
  opacity: 'var(--chronivs-glass-opacity)',
  border: 'var(--chronivs-glass-border)',
  saturation: 'var(--chronivs-glass-saturation)',
} as const;

export type ElevationToken = typeof elevation;
export type BlurToken = typeof blur;
