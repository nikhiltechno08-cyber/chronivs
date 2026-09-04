import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '../../lib/cn';

const chipVariants = cva(
  'inline-flex items-center gap-1.5 rounded-[var(--chronivs-radius-pill)] border font-medium transition-colors duration-300',
  {
    variants: {
      variant: {
        default: 'border-[var(--chronivs-border-default)] bg-[var(--chronivs-surface-primary)] text-[var(--chronivs-fg-secondary)]',
        selected: 'border-[var(--chronivs-primary)] bg-[var(--chronivs-primary)]/10 text-[var(--chronivs-primary-bright)]',
      },
      size: {
        sm: 'px-3 py-1 text-[length:var(--chronivs-text-caption)]',
        md: 'px-4 py-1.5 text-[length:var(--chronivs-text-body-sm)]',
      },
    },
    defaultVariants: { variant: 'default', size: 'sm' },
  },
);

export type ChipProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof chipVariants>;

export const Chip = forwardRef<HTMLSpanElement, ChipProps>(
  ({ className, variant, size, ...props }, ref) => (
    <span ref={ref} className={cn(chipVariants({ variant, size }), className)} {...props} />
  ),
);
Chip.displayName = 'Chip';

export { chipVariants };
