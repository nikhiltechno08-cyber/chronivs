'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchAdminPayments } from '../admin-payments-service';
import type { AdminPaymentsQuery } from '../types';

export function useAdminPayments(query: AdminPaymentsQuery) {
  return useQuery({
    queryKey: ['admin', 'payments', query],
    queryFn: () => fetchAdminPayments(query),
    staleTime: 15_000,
    placeholderData: (previous) => previous,
  });
}
