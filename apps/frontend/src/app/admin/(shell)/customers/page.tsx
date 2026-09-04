import { Suspense } from 'react';

import { AdminAuthLoader } from '@/features/admin/auth';
import { AdminCustomersPage } from '@/features/admin/customers';

export const metadata = {
  title: 'Customers',
  robots: { index: false, follow: false },
};

export default function AdminCustomersRoutePage() {
  return (
    <Suspense fallback={<AdminAuthLoader message="Loading customers…" />}>
      <AdminCustomersPage />
    </Suspense>
  );
}
