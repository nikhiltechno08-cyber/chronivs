import type { AdminSystemStatusItem } from '../types';
import { StatusBadge } from './StatusBadge';

type SystemStatusPanelProps = {
  items: AdminSystemStatusItem[];
};

export function SystemStatusPanel({ items }: SystemStatusPanelProps) {
  return (
    <ul className="admin-system-status">
      {items.map((item) => (
        <li key={item.label}>
          <span>{item.label}</span>
          <StatusBadge status={item.status} />
        </li>
      ))}
    </ul>
  );
}
