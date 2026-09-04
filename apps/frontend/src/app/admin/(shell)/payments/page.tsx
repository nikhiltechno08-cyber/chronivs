import { Suspense } from 'react';

import { AdminAuthLoader } from '@/features/admin/auth';
import { AdminPaymentsPage } from '@/features/admin/payments';

export const metadata = {
  title: 'Payments',
  robots: { index: false, follow: false },
};

export default function AdminPaymentsRoutePage() {
  return (
    <Suspense fallback={<AdminAuthLoader message="Loading payments…" />}>
      <AdminPaymentsPage />
    </Suspense>
  );
}
