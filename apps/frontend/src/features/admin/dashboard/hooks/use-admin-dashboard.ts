'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchAdminDashboard } from '../admin-dashboard-service';

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: fetchAdminDashboard,
    staleTime: 30_000,
    retry: 1,
  });
}
