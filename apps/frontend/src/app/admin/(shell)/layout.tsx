import { AdminAuthGuard } from '@/features/admin/auth';

export default function AdminShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminAuthGuard>{children}</AdminAuthGuard>;
}
