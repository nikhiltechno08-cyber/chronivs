import type { ReactNode } from 'react';

export type AppShellProps = {
  children: ReactNode;
};

export type BoundaryFallbackProps = {
  error?: Error;
  reset?: () => void;
};

export type LoadingBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

export type RouteTransitionWrapperProps = {
  children: ReactNode;
};
