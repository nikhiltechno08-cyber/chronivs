'use client';

import * as ProgressPrimitive from '@radix-ui/react-progress';
import { forwardRef, type ComponentPropsWithoutRef } from 'react';

import { cn } from '../../lib/cn';

export type ProgressProps = ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
  indicatorClassName?: string;
};

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, indicatorClassName, ...props }, ref) => (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-[var(--chronivs-radius-pill)]',
        'bg-[var(--chronivs-surface-primary)]',
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          'h-full rounded-[var(--chronivs-radius-pill)] bg-gradient-to-r from-[var(--chronivs-primary)] to-[var(--chronivs-primary-bright)]',
          'transition-transform duration-500 ease-[var(--chronivs-ease-cinematic)]',
          indicatorClassName,
        )}
        style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  ),
);
Progress.displayName = 'Progress';
