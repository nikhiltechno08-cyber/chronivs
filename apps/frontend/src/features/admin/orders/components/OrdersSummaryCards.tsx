'use client';

import {
  CheckCircle2,
  Clock3,
  CreditCard,
  ShoppingBag,
  TrendingUp,
  XCircle,
} from 'lucide-react';

import { StatCard } from '@/features/admin/dashboard/components/StatCard';

import type { AdminOrderSummary } from '../types';

type OrdersSummaryCardsProps = {
  summary: AdminOrderSummary;
  unavailable?: boolean;
};

function formatCount(value: number, unavailable?: boolean): string {
  if (unavailable) return 'No data available';
  return new Intl.NumberFormat('en-IN').format(value);
}

function formatRevenue(value: number, currency: string, unavailable?: boolean): string {
  if (unavailable) return 'No data available';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function OrdersSummaryCards({ summary, unavailable }: OrdersSummaryCardsProps) {
  return (
    <section aria-label="Orders summary" className="admin-stat-grid admin-orders-summary">
      <StatCard
        icon={ShoppingBag}
        title="Total Orders"
        value={formatCount(summary.totalOrders, unavailable)}
        helperText="All checkout sessions"
        unavailable={unavailable}
      />
      <StatCard
        icon={CheckCircle2}
        title="Completed"
        value={formatCount(summary.completed, unavailable)}
        helperText="Successful payments"
        unavailable={unavailable}
      />
      <StatCard
        icon={Clock3}
        title="Pending"
        value={formatCount(summary.pending, unavailable)}
        helperText="Awaiting payment"
        unavailable={unavailable}
      />
      <StatCard
        icon={XCircle}
        title="Failed"
        value={formatCount(summary.failed, unavailable)}
        helperText="Failed or abandoned"
        unavailable={unavailable}
      />
      <StatCard
        icon={TrendingUp}
        title="Today's Orders"
        value={formatCount(summary.todaysOrders, unavailable)}
        helperText="Created today (UTC)"
        unavailable={unavailable}
      />
      <StatCard
        icon={CreditCard}
        title="Today's Revenue"
        value={formatRevenue(summary.todaysRevenue, summary.currency, unavailable)}
        helperText="Paid orders today"
        unavailable={unavailable}
      />
    </section>
  );
}
