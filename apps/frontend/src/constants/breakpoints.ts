export { breakpoints, type BreakpointKey } from '@/theme/tokens/breakpoints';

export const BREAKPOINT_MEDIA_QUERIES = {
  xs: '(min-width: 390px)',
  sm: '(min-width: 430px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1440px)',
  '2xl': '(min-width: 1920px)',
} as const;

export const MAX_CONTENT_WIDTH = {
  xs: 320,
  sm: 384,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1440,
} as const;
