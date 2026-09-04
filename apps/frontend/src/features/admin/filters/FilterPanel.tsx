import type { ReactNode } from 'react';

import { cn } from '@chronivs/ui';

type FilterPanelProps = {
  children: ReactNode;
  className?: string;
};

export function FilterPanel({ children, className }: FilterPanelProps) {
  return <div className={cn('admin-order-filters', className)}>{children}</div>;
}
