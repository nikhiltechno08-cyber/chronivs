export type AdminSystemStatus = 'operational' | 'unavailable' | 'degraded';

export type AdminKpiMetrics = {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  revenue: number;
  customers: number;
  publishedExperiences: number;
  currency: string;
};

export type AdminRecentOrder = {
  orderId: string;
  customer: string;
  customerEmail?: string | null;
  occasion?: string | null;
  template?: string | null;
  amount: number;
  currency: string;
  paymentStatus: string;
  checkoutStatus: string;
  createdAt: string;
};

export type AdminRecentExperience = {
  id: string;
  name: string;
  customer?: string | null;
  published: boolean;
  publishedAt?: string | null;
  createdAt: string;
  publicUrl?: string | null;
};

export type AdminSystemStatusItem = {
  label: string;
  status: AdminSystemStatus | string;
};

export type AdminDashboardData = {
  available: boolean;
  message?: string | null;
  kpis: AdminKpiMetrics | null;
  recentOrders: AdminRecentOrder[];
  recentExperiences: AdminRecentExperience[];
  systemStatus: AdminSystemStatusItem[];
};
