import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '../../lib/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-[var(--chronivs-radius-pill)] font-medium',
  {
    variants: {
      variant: {
        default: 'bg-[var(--chronivs-surface-strong)] text-[var(--chronivs-fg-primary)]',
        primary: 'bg-[var(--chronivs-primary)]/15 text-[var(--chronivs-primary-bright)]',
        success: 'bg-[var(--chronivs-success)]/15 text-[var(--chronivs-success)]',
        warning: 'bg-[var(--chronivs-warning)]/15 text-[var(--chronivs-warning)]',
        danger: 'bg-[var(--chronivs-danger)]/15 text-[var(--chronivs-danger)]',
      },
      size: {
        sm: 'px-2 py-0.5 text-[length:var(--chronivs-text-caption)]',
        md: 'px-3 py-1 text-[length:var(--chronivs-text-body-sm)]',
      },
    },
    defaultVariants: { variant: 'default', size: 'sm' },
  },
);

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant, size }), className)} {...props} />
  ),
);
Badge.displayName = 'Badge';

export { badgeVariants };
