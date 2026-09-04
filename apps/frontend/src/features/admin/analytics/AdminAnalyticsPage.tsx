'use client';

import {
  LineChart,
  Percent,
  ShoppingBag,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react';

import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';

import { useAdminAnalytics } from './hooks/use-admin-analytics';
import { ActivityTimeline } from './components/ActivityTimeline';
import { AnalyticsCard } from './components/AnalyticsCard';
import { AnalyticsEmptyState } from './components/AnalyticsEmptyState';
import { ChartCard } from './components/ChartCard';
import { RankedListCard } from './components/RankedListCard';
import { StatsGrid } from './components/StatsGrid';
import type { AdminAnalyticsData } from './types';

function formatCount(value: number | undefined): string {
  if (value === undefined) {
    return '0';
  }
  return new Intl.NumberFormat('en-IN').format(value);
}

function formatCurrency(value: number | undefined, currency: string): string {
  if (value === undefined) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(0);
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function AdminAnalyticsPage() {
  const { data, isLoading, isError } = useAdminAnalytics();
  const analytics = data as AdminAnalyticsData | undefined;
  const unavailable = isError || !analytics?.available || !analytics.metrics;
  const metrics = analytics?.metrics;
  const currency = metrics?.currency ?? 'INR';

  const currencyFormatter = (value: number) => formatCurrency(value, currency);
  const countFormatter = (value: number) => formatCount(value);

  const occasionChartData =
    analytics?.popularOccasions.map((item) => ({ label: item.label, value: item.count })) ?? [];
  const templateChartData =
    analytics?.popularTemplates.map((item) => ({ label: item.label, value: item.count })) ?? [];

  return (
    <div className="admin-page admin-analytics-page">
      <AdminPageHeader
        title="Analytics"
        description="Understand how Chronivs is growing."
      />

      {isLoading ? (
        <div className="admin-dashboard-loading" role="status" aria-live="polite">
          <span className="admin-auth-loading-spinner" aria-hidden="true" />
          <span>Loading analytics…</span>
        </div>
      ) : unavailable || !analytics ? (
        <AnalyticsEmptyState />
      ) : (
        <>
          <StatsGrid>
            <AnalyticsCard
              icon={Wallet}
              title="Revenue"
              value={formatCurrency(metrics?.revenue, currency)}
              helperText="Successful payments only"
            />
            <AnalyticsCard
              icon={ShoppingBag}
              title="Orders"
              value={formatCount(metrics?.orders)}
              helperText="All checkout sessions"
            />
            <AnalyticsCard
              icon={Users}
              title="Customers"
              value={formatCount(metrics?.customers)}
              helperText="Unique checkout emails"
            />
            <AnalyticsCard
              icon={Sparkles}
              title="Experiences"
              value={formatCount(metrics?.experiences)}
              helperText="Active published experiences"
            />
            <AnalyticsCard
              icon={Percent}
              title="Conversion Rate"
              value="Coming soon"
              helperText="Checkout to purchase funnel"
              placeholder
            />
          </StatsGrid>

          <section className="admin-analytics-chart-grid">
            <ChartCard
              title="Revenue Trend"
              description="Daily successful payment revenue over the last 30 days."
              data={analytics.revenueTrend}
              variant="area"
              valueFormatter={currencyFormatter}
            />
            <ChartCard
              title="Orders Trend"
              description="Daily checkout sessions over the last 30 days."
              data={analytics.ordersTrend}
              variant="line"
              valueFormatter={countFormatter}
            />
            <ChartCard
              title="Popular Occasions"
              description="Paid purchases grouped by occasion."
              data={occasionChartData}
              variant="bar"
              valueFormatter={countFormatter}
              emptyLabel="No occasion purchases recorded yet."
            />
            <ChartCard
              title="Popular Templates"
              description="Paid purchases grouped by template."
              data={templateChartData}
              variant="bar"
              valueFormatter={countFormatter}
              emptyLabel="No template purchases recorded yet."
            />
            <ChartCard
              title="Daily Purchases"
              description="Successful payments per day over the last 30 days."
              data={analytics.dailyPurchases}
              variant="line"
              valueFormatter={countFormatter}
            />
            <ChartCard
              title="Monthly Revenue"
              description="Successful payment revenue by month."
              data={analytics.monthlyRevenue}
              variant="bar"
              valueFormatter={currencyFormatter}
            />
          </section>

          <section className="admin-analytics-secondary-grid">
            <RankedListCard
              title="Top Occasions"
              description="Featured occasions with purchase counts."
              items={analytics.topOccasions}
            />
            <RankedListCard
              title="Top Templates"
              description="Most purchased templates."
              items={analytics.topTemplates}
            />
            <article className="admin-analytics-activity-card">
              <div className="admin-analytics-chart-card-header">
                <div>
                  <h3>Recent Activity</h3>
                  <p>Latest payments, generated experiences, and customer purchases.</p>
                </div>
                <LineChart aria-hidden="true" className="admin-analytics-activity-icon" />
              </div>
              <ActivityTimeline items={analytics.recentActivity} />
            </article>
          </section>
        </>
      )}
    </div>
  );
}
