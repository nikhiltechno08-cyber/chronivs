import { type LucideIcon } from 'lucide-react';

import { cn } from '@chronivs/ui';

type StatCardProps = {
  icon: LucideIcon;
  title: string;
  value: string;
  helperText: string;
  unavailable?: boolean;
};

export function StatCard({ icon: Icon, title, value, helperText, unavailable }: StatCardProps) {
  return (
    <article className={cn('admin-stat-card', unavailable && 'is-unavailable')}>
      <div className="admin-stat-card-icon" aria-hidden="true">
        <Icon />
      </div>
      <div className="admin-stat-card-copy">
        <p className="admin-stat-card-title">{title}</p>
        <p className="admin-stat-card-value">{value}</p>
        <p className="admin-stat-card-helper">{helperText}</p>
      </div>
    </article>
  );
}
