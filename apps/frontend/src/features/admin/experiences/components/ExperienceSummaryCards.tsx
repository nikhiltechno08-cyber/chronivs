'use client';

import { CheckCircle2, Clock3, Layers, Sparkles } from 'lucide-react';

import { StatCard } from '@/features/admin/dashboard/components/StatCard';

import type { AdminExperienceSummary } from '../types';

type ExperienceSummaryCardsProps = {
  summary: AdminExperienceSummary;
  unavailable?: boolean;
};

function formatCount(value: number, unavailable?: boolean): string {
  if (unavailable) return 'No data available';
  return new Intl.NumberFormat('en-IN').format(value);
}

export function ExperienceSummaryCards({ summary, unavailable }: ExperienceSummaryCardsProps) {
  return (
    <section aria-label="Experiences summary" className="admin-stat-grid admin-experiences-summary">
      <StatCard
        icon={CheckCircle2}
        title="Published"
        value={formatCount(summary.published, unavailable)}
        helperText="Live shareable experiences"
        unavailable={unavailable}
      />
      <StatCard
        icon={Clock3}
        title="Draft"
        value={formatCount(summary.draft, unavailable)}
        helperText="Not yet published"
        unavailable={unavailable}
      />
      <StatCard
        icon={Sparkles}
        title="Expired"
        value={formatCount(summary.expired, unavailable)}
        helperText="Past share-link expiry"
        unavailable={unavailable}
      />
      <StatCard
        icon={Layers}
        title="Total Experiences"
        value={formatCount(summary.total, unavailable)}
        helperText="All generated experiences"
        unavailable={unavailable}
      />
    </section>
  );
}
