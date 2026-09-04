import Link from 'next/link';
import { type ReactNode } from 'react';

import { cn } from '@chronivs/ui';

type PrimaryButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
};

export function PrimaryButton({ href, children, className, ariaLabel }: PrimaryButtonProps) {
  return (
    <Link href={href} className={cn('landing-btn-primary', className)} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}
