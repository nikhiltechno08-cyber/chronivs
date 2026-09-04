import type { AdminSettingsHealthItem } from '../types';
import { HealthBadge } from './HealthBadge';

type SystemStatusCardProps = {
  items: AdminSettingsHealthItem[];
};

export function SystemStatusCard({ items }: SystemStatusCardProps) {
  return (
    <article className="admin-settings-status-card">
      <div className="admin-settings-config-card-header">
        <h3>System Health</h3>
        <p>Live service availability from the Chronivs backend.</p>
      </div>
      <ul className="admin-settings-status-list">
        {items.map((item) => (
          <li key={item.label}>
            <span>{item.label}</span>
            <HealthBadge status={item.status} />
          </li>
        ))}
      </ul>
    </article>
  );
}
