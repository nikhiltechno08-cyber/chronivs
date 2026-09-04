import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '../../lib/cn';

const cardVariants = cva('rounded-[var(--chronivs-radius-xl)] border transition-[transform,box-shadow,border-color,background] duration-500', {
  variants: {
    variant: {
      default: [
        'border-[var(--chronivs-border-subtle)] bg-[var(--chronivs-surface-primary)]',
        'hover:-translate-y-1.5 hover:border-[var(--chronivs-border-default)]',
      ],
      glass: [
        'chronivs-glass border-[var(--chronivs-glass-border)]',
        'hover:-translate-y-1.5 hover:bg-[var(--chronivs-surface-strong)]',
      ],
      elevated: [
        'border-[var(--chronivs-border-subtle)] bg-[var(--chronivs-surface-elevated)]',
        'shadow-[var(--chronivs-shadow-md)] hover:-translate-y-1.5',
      ],
    },
    padding: {
      none: '',
      sm: 'p-6',
      md: 'p-[38px_32px]',
      lg: 'p-[44px_34px]',
    },
  },
  defaultVariants: {
    variant: 'default',
    padding: 'md',
  },
});

export type CardProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>;

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div ref={ref} className={cn(cardVariants({ variant, padding }), className)} {...props} />
  ),
);
Card.displayName = 'Card';

export const GlassCard = forwardRef<HTMLDivElement, Omit<CardProps, 'variant'>>(
  (props, ref) => <Card ref={ref} variant="glass" {...props} />,
);
GlassCard.displayName = 'GlassCard';

export { cardVariants };
