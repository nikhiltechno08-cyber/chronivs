export type AdminAnalyticsMetrics = {
  revenue: number;
  orders: number;
  customers: number;
  experiences: number;
  conversionRate: number | null;
  currency: string;
};

export type AdminAnalyticsTrendPoint = {
  label: string;
  value: number;
};

export type AdminAnalyticsCountItem = {
  key: string;
  label: string;
  count: number;
};

export type AdminAnalyticsActivityType =
  | 'payment_completed'
  | 'experience_generated'
  | 'customer_purchased';

export type AdminAnalyticsActivityItem = {
  id: string;
  type: AdminAnalyticsActivityType;
  title: string;
  subtitle: string;
  occurredAt: string;
};

export type AdminAnalyticsData = {
  available: boolean;
  message?: string | null;
  metrics: AdminAnalyticsMetrics | null;
  revenueTrend: AdminAnalyticsTrendPoint[];
  ordersTrend: AdminAnalyticsTrendPoint[];
  dailyPurchases: AdminAnalyticsTrendPoint[];
  monthlyRevenue: AdminAnalyticsTrendPoint[];
  popularOccasions: AdminAnalyticsCountItem[];
  popularTemplates: AdminAnalyticsCountItem[];
  topOccasions: AdminAnalyticsCountItem[];
  topTemplates: AdminAnalyticsCountItem[];
  recentActivity: AdminAnalyticsActivityItem[];
};
