'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchAdminPaymentDetail } from '../admin-payments-service';

export function useAdminPaymentDetail(recordId: string | null) {
  return useQuery({
    queryKey: ['admin', 'payments', 'detail', recordId],
    queryFn: () => fetchAdminPaymentDetail(recordId as string),
    enabled: Boolean(recordId),
    staleTime: 15_000,
  });
}
