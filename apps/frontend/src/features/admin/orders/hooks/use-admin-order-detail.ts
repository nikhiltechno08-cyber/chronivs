'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchAdminOrderDetail } from '../admin-orders-service';

export function useAdminOrderDetail(orderId: string | null) {
  return useQuery({
    queryKey: ['admin', 'orders', 'detail', orderId],
    queryFn: () => fetchAdminOrderDetail(orderId as string),
    enabled: Boolean(orderId),
    staleTime: 15_000,
  });
}
