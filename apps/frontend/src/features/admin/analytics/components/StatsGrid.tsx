import type { ReactNode } from 'react';

type StatsGridProps = {
  children: ReactNode;
};

export function StatsGrid({ children }: StatsGridProps) {
  return (
    <section aria-label="Analytics overview metrics" className="admin-analytics-stats-grid">
      {children}
    </section>
  );
}
