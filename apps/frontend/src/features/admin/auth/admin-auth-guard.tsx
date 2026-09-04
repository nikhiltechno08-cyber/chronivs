'use client';

import { useEffect, type ReactNode } from 'react';

import { ADMIN_ROUTES } from '../constants/routes';
import { AdminLayout } from '../components/AdminLayout';
import { AdminAuthLoader } from './AdminAuthLoader';
import { useAdminAuth } from './use-admin-auth';

type AdminAuthGuardProps = {
  children: ReactNode;
};

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { isAuthenticated, isLoading } = useAdminAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.replace(ADMIN_ROUTES.login);
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading || !isAuthenticated) {
    return <AdminAuthLoader message="Securing admin workspace…" />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}

/** @deprecated Use AdminAuthGuard */
export const ProtectedAdminLayout = AdminAuthGuard;

/** @deprecated Use AdminAuthGuard */
export const ProtectedAdminRoute = AdminAuthGuard;
