import { cn } from '@chronivs/ui';

type ExperienceStatusBadgeProps = {
  status: string;
};

const LABELS: Record<string, string> = {
  published: 'Published',
  draft: 'Draft',
  expired: 'Expired',
};

export function ExperienceStatusBadge({ status }: ExperienceStatusBadgeProps) {
  const normalized = status.toLowerCase();
  const label = LABELS[normalized] ?? formatFallback(status);

  return (
    <span className={cn('admin-experience-status-badge', `is-${normalized}`)}>
      {label}
    </span>
  );
}

function formatFallback(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}
