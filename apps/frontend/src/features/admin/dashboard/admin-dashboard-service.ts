import { getAdminApiBase } from '@/features/admin/constants/api';

import type { AdminDashboardData } from './types';

type DashboardApiResponse = {
  available: boolean;
  message?: string | null;
  kpis?: {
    total_orders: number;
    completed_orders: number;
    pending_orders: number;
    revenue: string | number;
    customers: number;
    published_experiences: number;
    currency: string;
  } | null;
  recent_orders?: Array<{
    order_id: string;
    customer: string;
    customer_email?: string | null;
    occasion?: string | null;
    template?: string | null;
    amount: string | number;
    currency: string;
    payment_status: string;
    checkout_status: string;
    created_at: string;
  }>;
  recent_experiences?: Array<{
    id: string;
    name: string;
    customer?: string | null;
    published: boolean;
    published_at?: string | null;
    created_at: string;
    public_url?: string | null;
  }>;
  system_status?: Array<{
    label: string;
    status: string;
  }>;
};

function toNumber(value: string | number): number {
  return typeof value === 'number' ? value : Number.parseFloat(value);
}

function mapDashboardResponse(payload: DashboardApiResponse): AdminDashboardData {
  return {
    available: payload.available,
    message: payload.message,
    kpis: payload.kpis
      ? {
          totalOrders: payload.kpis.total_orders,
          completedOrders: payload.kpis.completed_orders,
          pendingOrders: payload.kpis.pending_orders,
          revenue: toNumber(payload.kpis.revenue),
          customers: payload.kpis.customers,
          publishedExperiences: payload.kpis.published_experiences,
          currency: payload.kpis.currency,
        }
      : null,
    recentOrders: (payload.recent_orders ?? []).map((order) => ({
      orderId: order.order_id,
      customer: order.customer,
      customerEmail: order.customer_email,
      occasion: order.occasion,
      template: order.template,
      amount: toNumber(order.amount),
      currency: order.currency,
      paymentStatus: order.payment_status,
      checkoutStatus: order.checkout_status,
      createdAt: order.created_at,
    })),
    recentExperiences: (payload.recent_experiences ?? []).map((experience) => ({
      id: experience.id,
      name: experience.name,
      customer: experience.customer,
      published: experience.published,
      publishedAt: experience.published_at,
      createdAt: experience.created_at,
      publicUrl: experience.public_url,
    })),
    systemStatus: (payload.system_status ?? []).map((item) => ({
      label: item.label,
      status: item.status,
    })),
  };
}

export async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  const response = await fetch(`${getAdminApiBase()}/admin/dashboard`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Unable to load dashboard data');
  }

  const payload = (await response.json()) as DashboardApiResponse;
  return mapDashboardResponse(payload);
}
