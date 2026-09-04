import Link from 'next/link';
import { ArrowUpRight, Settings, ShoppingBag, Sparkles, Users } from 'lucide-react';

import { ADMIN_ROUTES } from '@/features/admin/constants/routes';
import { LANDING_LINKS } from '@/components/landing/data';

const ACTIONS = [
  {
    label: 'Create Test Experience',
    href: LANDING_LINKS.studio,
    icon: Sparkles,
  },
  {
    label: 'View Orders',
    href: ADMIN_ROUTES.orders,
    icon: ShoppingBag,
  },
  {
    label: 'Customers',
    href: ADMIN_ROUTES.customers,
    icon: Users,
  },
  {
    label: 'Settings',
    href: ADMIN_ROUTES.settings,
    icon: Settings,
  },
] as const;

export function QuickActions() {
  return (
    <div className="admin-quick-actions">
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <Link key={action.label} href={action.href} className="admin-quick-action">
            <span className="admin-quick-action-icon" aria-hidden="true">
              <Icon />
            </span>
            <span>{action.label}</span>
            <ArrowUpRight aria-hidden="true" className="admin-quick-action-arrow" />
          </Link>
        );
      })}
    </div>
  );
}
