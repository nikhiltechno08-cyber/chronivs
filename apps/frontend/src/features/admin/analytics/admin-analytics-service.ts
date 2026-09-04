import { getAdminApiBase } from '@/features/admin/constants/api';

import type { AdminAnalyticsData } from './types';

function toNumber(value: string | number): number {
  return typeof value === 'number' ? value : Number.parseFloat(value);
}

type AnalyticsApiResponse = {
  available: boolean;
  message?: string | null;
  metrics?: {
    revenue: string | number;
    orders: number;
    customers: number;
    experiences: number;
    conversion_rate?: string | number | null;
    currency: string;
  } | null;
  revenue_trend?: Array<{ label: string; value: string | number }>;
  orders_trend?: Array<{ label: string; value: string | number }>;
  daily_purchases?: Array<{ label: string; value: string | number }>;
  monthly_revenue?: Array<{ label: string; value: string | number }>;
  popular_occasions?: Array<{ key: string; label: string; count: number }>;
  popular_templates?: Array<{ key: string; label: string; count: number }>;
  top_occasions?: Array<{ key: string; label: string; count: number }>;
  top_templates?: Array<{ key: string; label: string; count: number }>;
  recent_activity?: Array<{
    id: string;
    type: string;
    title: string;
    subtitle: string;
    occurred_at: string;
  }>;
};

function mapTrend(points: AnalyticsApiResponse['revenue_trend'] = []) {
  return points.map((point) => ({
    label: point.label,
    value: toNumber(point.value),
  }));
}

function mapCounts(items: AnalyticsApiResponse['popular_occasions'] = []) {
  return items.map((item) => ({
    key: item.key,
    label: item.label,
    count: item.count,
  }));
}

function mapAnalyticsResponse(payload: AnalyticsApiResponse): AdminAnalyticsData {
  return {
    available: payload.available,
    message: payload.message,
    metrics: payload.metrics
      ? {
          revenue: toNumber(payload.metrics.revenue),
          orders: payload.metrics.orders,
          customers: payload.metrics.customers,
          experiences: payload.metrics.experiences,
          conversionRate:
            payload.metrics.conversion_rate === null ||
            payload.metrics.conversion_rate === undefined
              ? null
              : toNumber(payload.metrics.conversion_rate),
          currency: payload.metrics.currency,
        }
      : null,
    revenueTrend: mapTrend(payload.revenue_trend),
    ordersTrend: mapTrend(payload.orders_trend),
    dailyPurchases: mapTrend(payload.daily_purchases),
    monthlyRevenue: mapTrend(payload.monthly_revenue),
    popularOccasions: mapCounts(payload.popular_occasions),
    popularTemplates: mapCounts(payload.popular_templates),
    topOccasions: mapCounts(payload.top_occasions),
    topTemplates: mapCounts(payload.top_templates),
    recentActivity: (payload.recent_activity ?? []).map((item) => ({
      id: item.id,
      type: item.type as AdminAnalyticsData['recentActivity'][number]['type'],
      title: item.title,
      subtitle: item.subtitle,
      occurredAt: item.occurred_at,
    })),
  };
}

export async function fetchAdminAnalytics(): Promise<AdminAnalyticsData> {
  const response = await fetch(`${getAdminApiBase()}/admin/analytics`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Unable to load analytics data');
  }

  const payload = (await response.json()) as AnalyticsApiResponse;
  return mapAnalyticsResponse(payload);
}

export const AnalyticsService = {
  fetch: fetchAdminAnalytics,
};
