'use client';

import { usePathname } from 'next/navigation';

import { PageTransition } from '@/animations/components/page-transition';
import type { RouteTransitionWrapperProps } from '@/types';

/** Experience routes render fullscreen — skip fade wrapper that can block visibility */
export function RouteTransitionWrapper({ children }: RouteTransitionWrapperProps) {
  const pathname = usePathname();

  if (pathname.startsWith('/experience')) {
    return <>{children}</>;
  }

  return <PageTransition>{children}</PageTransition>;
}
