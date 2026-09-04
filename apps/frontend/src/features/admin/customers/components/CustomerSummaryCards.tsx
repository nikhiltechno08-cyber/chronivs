'use client';

import { Repeat2, Sparkles, TrendingUp, Users } from 'lucide-react';

import { StatCard } from '@/features/admin/dashboard/components/StatCard';

import type { AdminCustomerSummary } from '../types';
import { formatAmount } from '../utils';

type CustomerSummaryCardsProps = {
  summary: AdminCustomerSummary;
  unavailable?: boolean;
};

function formatCount(value: number, unavailable?: boolean): string {
  if (unavailable) return 'No data available';
  return new Intl.NumberFormat('en-IN').format(value);
}

export function CustomerSummaryCards({ summary, unavailable }: CustomerSummaryCardsProps) {
  return (
    <section aria-label="Customers summary" className="admin-stat-grid admin-customers-summary">
      <StatCard
        icon={Users}
        title="Total Customers"
        value={formatCount(summary.totalCustomers, unavailable)}
        helperText="Unique checkout customers"
        unavailable={unavailable}
      />
      <StatCard
        icon={Sparkles}
        title="New This Month"
        value={formatCount(summary.newThisMonth, unavailable)}
        helperText="First purchase this month"
        unavailable={unavailable}
      />
      <StatCard
        icon={Repeat2}
        title="Repeat Customers"
        value={formatCount(summary.repeatCustomers, unavailable)}
        helperText="More than one order"
        unavailable={unavailable}
      />
      <StatCard
        icon={TrendingUp}
        title="Total Revenue Generated"
        value={
          unavailable
            ? 'No data available'
            : formatAmount(summary.totalRevenue, summary.currency)
        }
        helperText="Successful payments"
        unavailable={unavailable}
      />
    </section>
  );
}
