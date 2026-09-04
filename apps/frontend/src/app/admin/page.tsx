import { AdminLoginShell } from '@/features/admin/auth';

export const metadata = {
  title: 'Admin Portal',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return <AdminLoginShell />;
}
