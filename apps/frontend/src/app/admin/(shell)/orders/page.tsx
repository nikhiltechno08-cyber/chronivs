import { Suspense } from 'react';

import { AdminAuthLoader } from '@/features/admin/auth';
import { AdminOrdersPage } from '@/features/admin/orders';

export const metadata = {
  title: 'Orders',
  robots: { index: false, follow: false },
};

export default function AdminOrdersRoutePage() {
  return (
    <Suspense fallback={<AdminAuthLoader message="Loading orders…" />}>
      <AdminOrdersPage />
    </Suspense>
  );
}
