import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-[transform,box-shadow,background,border-color] duration-300 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: [
          'rounded-[var(--chronivs-radius-pill)] bg-gradient-to-b from-[var(--chronivs-primary-bright)] to-[var(--chronivs-primary)]',
          'text-[var(--chronivs-fg-inverse)] shadow-[0_14px_34px_-10px_rgba(205,164,94,0.55)]',
          'hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-8px_rgba(205,164,94,0.7)]',
          'text-[length:var(--chronivs-text-button)] px-8 py-4',
        ],
        secondary: [
          'rounded-[var(--chronivs-radius-pill)] chronivs-glass border border-[var(--chronivs-border-default)]',
          'text-[var(--chronivs-accent-ivory)] hover:-translate-y-0.5 hover:bg-[var(--chronivs-surface-strong)]',
          'text-[length:var(--chronivs-text-button)] px-[30px] py-4',
        ],
        ghost: [
          'rounded-[var(--chronivs-radius-md)] text-[var(--chronivs-fg-secondary)]',
          'hover:bg-[var(--chronivs-surface-primary)] hover:text-[var(--chronivs-fg-primary)]',
          'text-[length:var(--chronivs-text-body-sm)] px-4 py-2',
        ],
        icon: [
          'rounded-full border border-[var(--chronivs-border-default)] text-[var(--chronivs-fg-secondary)]',
          'hover:border-[var(--chronivs-primary)] hover:text-[var(--chronivs-primary-bright)]',
          'h-11 w-11 min-h-[44px] min-w-[44px] p-0',
        ],
      },
      size: {
        sm: 'text-[length:var(--chronivs-text-caption)] px-4 py-2',
        md: '',
        lg: 'text-[length:var(--chronivs-text-body)] px-10 py-[19px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
