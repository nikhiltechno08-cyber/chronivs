import { type LucideIcon } from 'lucide-react';

import { cn } from '@chronivs/ui';

type AnalyticsCardProps = {
  icon: LucideIcon;
  title: string;
  value: string;
  helperText?: string;
  placeholder?: boolean;
};

export function AnalyticsCard({
  icon: Icon,
  title,
  value,
  helperText,
  placeholder = false,
}: AnalyticsCardProps) {
  return (
    <article className={cn('admin-analytics-card', placeholder && 'is-placeholder')}>
      <div className="admin-analytics-card-icon" aria-hidden="true">
        <Icon />
      </div>
      <div className="admin-analytics-card-copy">
        <p className="admin-analytics-card-title">{title}</p>
        <p className="admin-analytics-card-value">{value}</p>
        {helperText ? <p className="admin-analytics-card-helper">{helperText}</p> : null}
      </div>
    </article>
  );
}
