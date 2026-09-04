import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Settings,
  ShoppingBag,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react';

import { ADMIN_ROUTES, type AdminPageKey } from '../constants/routes';

export type AdminNavItem = {
  id: AdminPageKey;
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
  breadcrumb: string;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: ADMIN_ROUTES.dashboard,
    icon: LayoutDashboard,
    description: 'Overview of Chronivs platform activity and key metrics.',
    breadcrumb: 'Dashboard',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    href: ADMIN_ROUTES.analytics,
    icon: BarChart3,
    description: 'Understand revenue trends, purchases, and growth signals.',
    breadcrumb: 'Analytics',
  },
  {
    id: 'orders',
    label: 'Orders',
    href: ADMIN_ROUTES.orders,
    icon: ShoppingBag,
    description: 'Review customer orders, payment status, and fulfillment.',
    breadcrumb: 'Orders',
  },
  {
    id: 'customers',
    label: 'Customers',
    href: ADMIN_ROUTES.customers,
    icon: Users,
    description: 'Manage customer records and support history.',
    breadcrumb: 'Customers',
  },
  {
    id: 'experiences',
    label: 'Experiences',
    href: ADMIN_ROUTES.experiences,
    icon: Sparkles,
    description: 'Browse published experiences and studio activity.',
    breadcrumb: 'Experiences',
  },
  {
    id: 'payments',
    label: 'Payments',
    href: ADMIN_ROUTES.payments,
    icon: CreditCard,
    description: 'Monitor Razorpay transactions, refunds, and reconciliation.',
    breadcrumb: 'Payments',
  },
  {
    id: 'settings',
    label: 'Settings',
    href: ADMIN_ROUTES.settings,
    icon: Settings,
    description: 'Configure admin preferences and platform controls.',
    breadcrumb: 'Settings',
  },
];

export const ADMIN_LOGOUT_NAV = {
  label: 'Logout',
  icon: LogOut,
} as const;

export function getAdminNavItemByPath(pathname: string): AdminNavItem | undefined {
  return ADMIN_NAV_ITEMS.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
}

export function getAdminPageMeta(pageKey: AdminPageKey): AdminNavItem {
  const item = ADMIN_NAV_ITEMS.find((entry) => entry.id === pageKey);
  if (!item) {
    throw new Error(`Unknown admin page key: ${pageKey}`);
  }
  return item;
}
