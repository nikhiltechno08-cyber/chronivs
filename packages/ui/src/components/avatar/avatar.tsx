import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '../../lib/cn';

const avatarVariants = cva('inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full', {
  variants: {
    size: {
      sm: 'h-8 w-8 text-[length:var(--chronivs-text-caption)]',
      md: 'h-[34px] w-[34px] text-[length:var(--chronivs-text-body-sm)]',
      lg: 'h-12 w-12 text-[length:var(--chronivs-text-body)]',
    },
  },
  defaultVariants: { size: 'md' },
});

export type AvatarProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof avatarVariants> & {
    src?: string;
    alt?: string;
    fallback?: string;
  };

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, src, alt, fallback, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        avatarVariants({ size }),
        'bg-gradient-to-br from-[var(--chronivs-primary-bright)] to-[var(--chronivs-primary)]',
        'font-medium text-[var(--chronivs-fg-inverse)]',
        className,
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt ?? ''} className="h-full w-full object-cover" />
      ) : (
        <span aria-hidden="true">{fallback?.charAt(0).toUpperCase()}</span>
      )}
    </div>
  ),
);
Avatar.displayName = 'Avatar';

export { avatarVariants };
