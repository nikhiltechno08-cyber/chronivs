/** Breakpoints in px — mobile-first */

export const breakpoints = {
  xs: 390,
  sm: 430,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1440,
  '3xl': 1920,
} as const;

export type BreakpointKey = keyof typeof breakpoints;

export const mediaQueries = {
  xs: `(min-width: ${breakpoints.xs}px)`,
  sm: `(min-width: ${breakpoints.sm}px)`,
  md: `(min-width: ${breakpoints.md}px)`,
  lg: `(min-width: ${breakpoints.lg}px)`,
  xl: `(min-width: ${breakpoints.xl}px)`,
  '2xl': `(min-width: ${breakpoints['2xl']}px)`,
  '3xl': `(min-width: ${breakpoints['3xl']}px)`,
} as const;
