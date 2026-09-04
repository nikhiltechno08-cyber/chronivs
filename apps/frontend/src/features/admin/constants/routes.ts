export const ADMIN_ROUTES = {
  login: '/admin',
  dashboard: '/admin/dashboard',
  analytics: '/admin/analytics',
  orders: '/admin/orders',
  customers: '/admin/customers',
  experiences: '/admin/experiences',
  payments: '/admin/payments',
  settings: '/admin/settings',
} as const;

export const ADMIN_PROTECTED_PATHS = [
  ADMIN_ROUTES.dashboard,
  ADMIN_ROUTES.analytics,
  ADMIN_ROUTES.orders,
  ADMIN_ROUTES.customers,
  ADMIN_ROUTES.experiences,
  ADMIN_ROUTES.payments,
  ADMIN_ROUTES.settings,
] as const;

export type AdminPageKey =
  | 'dashboard'
  | 'analytics'
  | 'orders'
  | 'customers'
  | 'experiences'
  | 'payments'
  | 'settings';
