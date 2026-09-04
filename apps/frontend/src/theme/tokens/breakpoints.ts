/** Breakpoint values in pixels — mobile-first */
export const breakpoints = {
  xs: 390,
  sm: 430,
  md: 768,
  lg: 1024,
  xl: 1440,
  '2xl': 1920,
} as const;

export type BreakpointKey = keyof typeof breakpoints;

export const breakpointValues = Object.values(breakpoints);
