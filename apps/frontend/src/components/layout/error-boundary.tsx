'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

import type { BoundaryFallbackProps } from '@/types';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: (props: BoundaryFallbackProps) => ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

function DefaultErrorFallback({ error, reset }: BoundaryFallbackProps) {
  return (
    <div role="alert" className="flex min-h-[50vh] flex-col items-center justify-center p-8">
      <h2 className="text-lg font-semibold text-[var(--color-fg-primary)]">
        Something went wrong
      </h2>
      {error && (
        <p className="mt-2 max-w-md text-center text-sm text-[var(--color-fg-muted)]">
          {error.message}
        </p>
      )}
      {reset && (
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded-md bg-[var(--color-brand-600)] px-4 py-2 text-sm text-white"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  override render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback ?? DefaultErrorFallback;
      return <Fallback error={this.state.error ?? undefined} reset={this.handleReset} />;
    }

    return this.props.children;
  }
}
