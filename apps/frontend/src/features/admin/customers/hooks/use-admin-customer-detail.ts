'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchAdminCustomerDetail } from '../admin-customers-service';

export function useAdminCustomerDetail(email: string | null) {
  return useQuery({
    queryKey: ['admin', 'customers', 'detail', email],
    queryFn: () => fetchAdminCustomerDetail(email as string),
    enabled: Boolean(email),
    staleTime: 15_000,
  });
}
