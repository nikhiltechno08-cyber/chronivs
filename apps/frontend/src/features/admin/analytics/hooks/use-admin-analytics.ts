'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchAdminAnalytics } from '../admin-analytics-service';

export function useAdminAnalytics() {
  return useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: fetchAdminAnalytics,
    staleTime: 60_000,
  });
}
