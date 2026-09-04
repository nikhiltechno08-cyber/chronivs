import Link from 'next/link';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

import { ADMIN_ROUTES } from '@/features/admin/constants/routes';
import { AdminEmptyState } from '@/features/admin/components/AdminEmptyState';

export function OrdersEmptyState() {
  return (
    <AdminEmptyState
      icon={ShoppingBag}
      title="No orders yet"
      description="No orders have been placed yet."
    >
      <Link href={ADMIN_ROUTES.dashboard} className="admin-empty-state-link">
        <ArrowLeft aria-hidden="true" />
        Back to Dashboard
      </Link>
    </AdminEmptyState>
  );
}
