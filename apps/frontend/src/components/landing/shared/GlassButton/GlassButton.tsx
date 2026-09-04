import Link from 'next/link';
import { type ReactNode } from 'react';

import { cn } from '@chronivs/ui';

type GlassButtonProps = {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
};

export function GlassButton({ href, onClick, children, className, icon }: GlassButtonProps) {
  const classNames = cn('landing-btn-glass', className);

  if (onClick) {
    return (
      <button type="button" className={classNames} onClick={onClick}>
        {icon}
        {children}
      </button>
    );
  }

  return (
    <Link href={href ?? '#'} className={classNames}>
      {icon}
      {children}
    </Link>
  );
}

export function PlayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.5" />
      <path d="M10 8.5l6 3.5-6 3.5z" />
    </svg>
  );
}
