import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '../../lib/cn';

export type DividerProps = HTMLAttributes<HTMLHRElement> & {
  orientation?: 'horizontal' | 'vertical';
};

export const Divider = forwardRef<HTMLHRElement, DividerProps>(
  ({ className, orientation = 'horizontal', ...props }, ref) => (
    <hr
      ref={ref}
      role="separator"
      aria-orientation={orientation}
      className={cn(
        'border-0 bg-[var(--chronivs-border-subtle)]',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
      {...props}
    />
  ),
);
Divider.displayName = 'Divider';
