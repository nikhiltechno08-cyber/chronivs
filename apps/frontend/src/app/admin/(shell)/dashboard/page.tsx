import { AdminDashboardPage } from '@/features/admin/dashboard';

export const metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};

export default function AdminDashboardRoutePage() {
  return <AdminDashboardPage />;
}
