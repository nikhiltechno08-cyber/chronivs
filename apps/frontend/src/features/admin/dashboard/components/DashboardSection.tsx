import { type ReactNode } from 'react';

type DashboardSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
};

export function DashboardSection({ title, description, children, actions }: DashboardSectionProps) {
  return (
    <section className="admin-dashboard-section">
      <div className="admin-dashboard-section-head">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {actions ? <div className="admin-dashboard-section-actions">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}
