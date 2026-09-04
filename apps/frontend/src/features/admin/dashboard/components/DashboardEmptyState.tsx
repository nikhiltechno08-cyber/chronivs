import { type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';

type DashboardEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: ReactNode;
};

export function DashboardEmptyState({ icon: Icon, title, description, children }: DashboardEmptyStateProps) {
  return (
    <div className="admin-dashboard-empty">
      <div className="admin-dashboard-empty-icon" aria-hidden="true">
        <Icon />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {children ? <div className="admin-dashboard-empty-actions">{children}</div> : null}
    </div>
  );
}
