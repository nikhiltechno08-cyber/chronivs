'use client';

import { ErrorBoundary } from './error-boundary';
import { LoadingBoundary } from './loading-boundary';
import { RouteTransitionWrapper } from './route-transition-wrapper';
import type { AppShellProps } from '@/types';

export function AppShell({ children }: AppShellProps) {
  return (
    <ErrorBoundary>
      <LoadingBoundary>
        <RouteTransitionWrapper>
          <div id="app-root" className="relative min-h-dvh">
            {children}
          </div>
        </RouteTransitionWrapper>
      </LoadingBoundary>
    </ErrorBoundary>
  );
}
