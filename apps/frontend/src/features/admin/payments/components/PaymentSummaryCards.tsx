'use client';

import { CheckCircle2, Clock3, CreditCard, RotateCcw, TrendingUp, Wallet } from 'lucide-react';

import { StatCard } from '@/features/admin/dashboard/components/StatCard';

import type { AdminPaymentSummary } from '../types';
import { formatAmount } from '../utils';

type PaymentSummaryCardsProps = {
  summary: AdminPaymentSummary;
  unavailable?: boolean;
};

function formatCount(value: number, unavailable?: boolean): string {
  if (unavailable) return 'No data available';
  return new Intl.NumberFormat('en-IN').format(value);
}

export function PaymentSummaryCards({ summary, unavailable }: PaymentSummaryCardsProps) {
  return (
    <section aria-label="Payments summary" className="admin-stat-grid admin-payments-summary">
      <StatCard
        icon={Wallet}
        title="Total Revenue"
        value={
          unavailable ? 'No data available' : formatAmount(summary.totalRevenue, summary.currency)
        }
        helperText="Successful payments only"
        unavailable={unavailable}
      />
      <StatCard
        icon={TrendingUp}
        title="Today's Revenue"
        value={
          unavailable ? 'No data available' : formatAmount(summary.todaysRevenue, summary.currency)
        }
        helperText="Paid today (UTC)"
        unavailable={unavailable}
      />
      <StatCard
        icon={CheckCircle2}
        title="Successful Payments"
        value={formatCount(summary.successfulPayments, unavailable)}
        helperText="Completed transactions"
        unavailable={unavailable}
      />
      <StatCard
        icon={Clock3}
        title="Pending Payments"
        value={formatCount(summary.pendingPayments, unavailable)}
        helperText="Awaiting confirmation"
        unavailable={unavailable}
      />
      <StatCard
        icon={CreditCard}
        title="Failed Payments"
        value={formatCount(summary.failedPayments, unavailable)}
        helperText="Failed or cancelled"
        unavailable={unavailable}
      />
      <StatCard
        icon={RotateCcw}
        title="Refunded"
        value={formatCount(summary.refundedPayments, unavailable)}
        helperText="Future refund workflow"
        unavailable={unavailable}
      />
    </section>
  );
}
