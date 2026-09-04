import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '../../lib/cn';

export type LoadingProps = HTMLAttributes<HTMLDivElement> & {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
};

const sizes = { sm: 'h-5 w-5 border', md: 'h-8 w-8 border-2', lg: 'h-12 w-12 border-2' };

export const Loading = forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, size = 'md', label = 'Loading', ...props }, ref) => (
    <div
      ref={ref}
      role="status"
      aria-label={label}
      className={cn('inline-flex items-center justify-center', className)}
      {...props}
    >
      <div
        className={cn(
          sizes[size],
          'animate-spin rounded-full border-[var(--chronivs-primary)] border-t-transparent',
        )}
      />
      <span className="sr-only">{label}</span>
    </div>
  ),
);
Loading.displayName = 'Loading';
