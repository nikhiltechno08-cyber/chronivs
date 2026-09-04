import { cn } from '@chronivs/ui';

type HealthBadgeProps = {
  status: string;
  label?: string;
};

function normalizeStatus(status: string): 'operational' | 'unavailable' | 'degraded' | 'neutral' {
  const value = status.toLowerCase();
  if (
    value === 'operational' ||
    value === 'ok' ||
    value === 'healthy' ||
    value === 'ready' ||
    value === 'configured' ||
    value === 'resend configured' ||
    value === 'enabled'
  ) {
    return 'operational';
  }
  if (
    value === 'degraded' ||
    value === 'warning' ||
    value === 'coming_soon' ||
    value === 'not_applicable'
  ) {
    return 'degraded';
  }
  if (value === 'not_configured' || value === 'not available' || value === 'unavailable') {
    return 'unavailable';
  }
  return 'neutral';
}

const DEFAULT_LABELS: Record<ReturnType<typeof normalizeStatus>, string> = {
  operational: 'Operational',
  unavailable: 'Unavailable',
  degraded: 'Coming soon',
  neutral: 'Status',
};

export function HealthBadge({ status, label }: HealthBadgeProps) {
  const normalized = normalizeStatus(status);
  const display = label ?? DEFAULT_LABELS[normalized];

  return (
    <span className={cn('admin-settings-health-badge', `is-${normalized}`)}>
      <span className="admin-settings-health-badge-dot" aria-hidden="true" />
      {display}
    </span>
  );
}

export function formatHealthStatus(status: string): string {
  const value = status.toLowerCase();
  if (value === 'operational') return 'Operational';
  if (value === 'unavailable') return 'Unavailable';
  if (value === 'coming_soon') return 'Coming soon';
  if (value === 'not_applicable') return 'Not applicable';
  if (value === 'not_configured') return 'Not configured';
  return status.replace(/_/g, ' ');
}
