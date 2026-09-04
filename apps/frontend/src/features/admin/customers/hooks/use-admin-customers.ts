'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchAdminCustomers } from '../admin-customers-service';
import type { AdminCustomersQuery } from '../types';

export function useAdminCustomers(query: AdminCustomersQuery) {
  return useQuery({
    queryKey: ['admin', 'customers', query],
    queryFn: () => fetchAdminCustomers(query),
    staleTime: 15_000,
    placeholderData: (previous) => previous,
  });
}
