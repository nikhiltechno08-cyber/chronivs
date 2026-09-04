import { cn } from '@chronivs/ui';

type StatusBadgeProps = {
  status: string;
};

function normalizeStatus(status: string): 'operational' | 'unavailable' | 'degraded' {
  const value = status.toLowerCase();
  if (value === 'operational' || value === 'ok' || value === 'healthy') {
    return 'operational';
  }
  if (value === 'degraded' || value === 'warning') {
    return 'degraded';
  }
  return 'unavailable';
}

const LABELS = {
  operational: 'Operational',
  unavailable: 'Unavailable',
  degraded: 'Degraded',
} as const;

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = normalizeStatus(status);

  return (
    <span className={cn('admin-status-badge', `is-${normalized}`)}>
      <span className="admin-status-badge-dot" aria-hidden="true" />
      {LABELS[normalized]}
    </span>
  );
}
