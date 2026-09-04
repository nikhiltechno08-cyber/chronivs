'use client';

import {
  CheckCircle2,
  Clock3,
  ShoppingBag,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react';

import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';

import { useAdminDashboard } from './hooks/use-admin-dashboard';
import { DashboardSection } from './components/DashboardSection';
import { ExperienceList } from './components/ExperienceList';
import { OrderTable } from './components/OrderTable';
import { QuickActions } from './components/QuickActions';
import { StatCard } from './components/StatCard';
import { SystemStatusPanel } from './components/SystemStatusPanel';

const NO_DATA = 'No data available';

function formatCount(value: number | undefined, unavailable: boolean): string {
  if (unavailable || value === undefined) {
    return NO_DATA;
  }
  return new Intl.NumberFormat('en-IN').format(value);
}

function formatRevenue(value: number | undefined, currency: string, unavailable: boolean): string {
  if (unavailable || value === undefined) {
    return NO_DATA;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function AdminDashboardPage() {
  const { data, isLoading, isError } = useAdminDashboard();
  const unavailable = isError || !data?.available || !data.kpis;
  const kpis = data?.kpis;
  const currency = kpis?.currency ?? 'INR';

  return (
    <div className="admin-page admin-dashboard-page">
      <AdminPageHeader
        title="Dashboard"
        description="Monitor your Chronivs business in one place."
      />

      {isLoading ? (
        <div className="admin-dashboard-loading" role="status" aria-live="polite">
          <span className="admin-auth-loading-spinner" aria-hidden="true" />
          <span>Loading dashboard…</span>
        </div>
      ) : (
        <>
          <section aria-label="Key performance indicators" className="admin-stat-grid">
            <StatCard
              icon={ShoppingBag}
              title="Total Orders"
              value={formatCount(kpis?.totalOrders, unavailable)}
              helperText="All checkout sessions"
              unavailable={unavailable}
            />
            <StatCard
              icon={CheckCircle2}
              title="Completed Orders"
              value={formatCount(kpis?.completedOrders, unavailable)}
              helperText="Checkout marked complete"
              unavailable={unavailable}
            />
            <StatCard
              icon={Clock3}
              title="Pending Orders"
              value={formatCount(kpis?.pendingOrders, unavailable)}
              helperText="Awaiting payment"
              unavailable={unavailable}
            />
            <StatCard
              icon={Wallet}
              title="Revenue"
              value={formatRevenue(kpis?.revenue, currency, unavailable)}
              helperText="Successful payments only"
              unavailable={unavailable}
            />
            <StatCard
              icon={Users}
              title="Customers"
              value={formatCount(kpis?.customers, unavailable)}
              helperText="Unique checkout emails"
              unavailable={unavailable}
            />
            <StatCard
              icon={Sparkles}
              title="Published Experiences"
              value={formatCount(kpis?.publishedExperiences, unavailable)}
              helperText="Live shareable experiences"
              unavailable={unavailable}
            />
          </section>

          <div className="admin-dashboard-grid">
            <DashboardSection
              title="Recent Orders"
              description="Latest 10 checkout sessions from your database."
            >
              <OrderTable orders={data?.recentOrders ?? []} />
            </DashboardSection>

            <DashboardSection
              title="Recent Experiences"
              description="Latest published experiences."
            >
              <ExperienceList experiences={data?.recentExperiences ?? []} />
            </DashboardSection>

            <DashboardSection title="Quick Actions" description="Common admin shortcuts.">
              <QuickActions />
            </DashboardSection>

            <DashboardSection title="System Status" description="Live service availability.">
              <SystemStatusPanel items={data?.systemStatus ?? []} />
            </DashboardSection>
          </div>
        </>
      )}
    </div>
  );
}
