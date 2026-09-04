import { Suspense } from 'react';

import { AdminAuthLoader } from '@/features/admin/auth';
import { AdminExperiencesPage } from '@/features/admin/experiences';

export const metadata = {
  title: 'Experiences',
  robots: { index: false, follow: false },
};

export default function AdminExperiencesRoutePage() {
  return (
    <Suspense fallback={<AdminAuthLoader message="Loading experiences…" />}>
      <AdminExperiencesPage />
    </Suspense>
  );
}
