'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchAdminSettings } from '../admin-settings-service';

export function useAdminSettings() {
  return useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: fetchAdminSettings,
    staleTime: 60_000,
  });
}
