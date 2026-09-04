import { AdminSessionProvider } from '@/features/admin/auth';

import '@/features/admin/styles/admin.css';

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="admin-root">
      <AdminSessionProvider>{children}</AdminSessionProvider>
    </div>
  );
}
