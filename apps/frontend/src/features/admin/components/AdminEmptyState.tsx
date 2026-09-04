import { type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';

type AdminEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: ReactNode;
};

export function AdminEmptyState({ icon: Icon, title, description, children }: AdminEmptyStateProps) {
  return (
    <div className="admin-empty-state">
      <div className="admin-empty-state-icon" aria-hidden="true">
        <Icon />
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
      {children ? <div className="admin-empty-state-actions">{children}</div> : null}
    </div>
  );
}
