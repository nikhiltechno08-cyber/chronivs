import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '../../lib/cn';

export type SectionContainerProps = HTMLAttributes<HTMLElement> & {
  as?: 'section' | 'div';
  narrow?: boolean;
};

export const SectionContainer = forwardRef<HTMLElement, SectionContainerProps>(
  ({ className, as: Tag = 'section', narrow, children, ...props }, ref) => (
    <Tag
      ref={ref as never}
      className={cn(
        'relative z-[3] py-[var(--chronivs-space-20)] max-[640px]:py-[100px]',
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          'mx-auto w-full max-w-[var(--chronivs-container-max)]',
          'px-[var(--chronivs-padding-mobile)] min-[768px]:px-[var(--chronivs-padding-tablet)] min-[1100px]:px-[var(--chronivs-padding-desktop)]',
          narrow && 'max-w-[var(--chronivs-container-narrow)]',
        )}
      >
        {children}
      </div>
    </Tag>
  ),
);
SectionContainer.displayName = 'SectionContainer';

export type PageContainerProps = HTMLAttributes<HTMLDivElement>;

export const PageContainer = forwardRef<HTMLDivElement, PageContainerProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'chronivs-app chronivs-min-h-dvh chronivs-no-scroll-x',
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          'mx-auto w-full max-w-[var(--chronivs-container-max)]',
          'px-[var(--chronivs-padding-mobile)] min-[768px]:px-[var(--chronivs-padding-tablet)] min-[1100px]:px-[var(--chronivs-padding-desktop)]',
        )}
      >
        {children}
      </div>
    </div>
  ),
);
PageContainer.displayName = 'PageContainer';

export type ResponsiveGridProps = HTMLAttributes<HTMLDivElement> & {
  cols?: { default?: number; md?: number; lg?: number };
  gap?: string;
};

export const ResponsiveGrid = forwardRef<HTMLDivElement, ResponsiveGridProps>(
  ({ className, cols = { default: 1, md: 2, lg: 3 }, gap = '22px', children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('grid', className)}
      style={{
        gap,
        gridTemplateColumns: `repeat(${cols.default ?? 1}, minmax(0, 1fr))`,
      }}
      {...props}
    >
      {children}
    </div>
  ),
);
ResponsiveGrid.displayName = 'ResponsiveGrid';
