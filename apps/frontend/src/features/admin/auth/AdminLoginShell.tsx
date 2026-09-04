'use client';

import { Suspense } from 'react';

import { useAdminAuth } from './use-admin-auth';
import { AdminAuthErrorAlert } from './AdminAuthErrorAlert';
import { AdminAuthLoader } from './AdminAuthLoader';
import { AdminLoginForm } from './AdminLoginForm';

function AdminLoginContent() {
  const { isLoading, error } = useAdminAuth();

  if (isLoading) {
    return <AdminAuthLoader message="Loading admin portal…" />;
  }

  return (
    <div className="admin-login-shell">
      <div className="admin-login-card">
        <span className="admin-sidebar-mark" aria-hidden="true">
          C
        </span>
        <h1>Admin Portal</h1>
        <p>Restricted access. Sign in with your admin credentials to continue.</p>
        {error ? <AdminAuthErrorAlert message={error} /> : null}
        <Suspense fallback={null}>
          <AdminLoginForm />
        </Suspense>
      </div>
    </div>
  );
}

export function AdminLoginShell() {
  return (
    <Suspense fallback={<AdminAuthLoader message="Loading admin portal…" />}>
      <AdminLoginContent />
    </Suspense>
  );
}
