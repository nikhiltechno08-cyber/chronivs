'use client';

import { BREAKPOINT_MEDIA_QUERIES, breakpoints } from '@/constants/breakpoints';
import type { BreakpointKey } from '@/theme/tokens/breakpoints';

import { useMediaQuery } from './use-media-query';

export function useBreakpoint(breakpoint: BreakpointKey): boolean {
  return useMediaQuery(BREAKPOINT_MEDIA_QUERIES[breakpoint]);
}

export function useBreakpointValue(): BreakpointKey {
  const is2xl = useMediaQuery(BREAKPOINT_MEDIA_QUERIES['2xl']);
  const isXl = useMediaQuery(BREAKPOINT_MEDIA_QUERIES.xl);
  const isLg = useMediaQuery(BREAKPOINT_MEDIA_QUERIES.lg);
  const isMd = useMediaQuery(BREAKPOINT_MEDIA_QUERIES.md);
  const isSm = useMediaQuery(BREAKPOINT_MEDIA_QUERIES.sm);
  const isXs = useMediaQuery(BREAKPOINT_MEDIA_QUERIES.xs);

  if (is2xl) return '2xl';
  if (isXl) return 'xl';
  if (isLg) return 'lg';
  if (isMd) return 'md';
  if (isSm) return 'sm';
  if (isXs) return 'xs';

  return 'xs';
}

export function useIsMobile(): boolean {
  return !useMediaQuery(BREAKPOINT_MEDIA_QUERIES.md);
}

export { breakpoints };
