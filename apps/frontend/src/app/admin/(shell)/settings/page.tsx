import { AdminSettingsPage } from '@/features/admin/settings';

export const metadata = {
  title: 'Settings',
  robots: { index: false, follow: false },
};

export default function AdminSettingsRoutePage() {
  return <AdminSettingsPage />;
}
