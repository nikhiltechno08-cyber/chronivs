'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchAdminOrders } from '../admin-orders-service';
import type { AdminOrdersQuery } from '../types';

export function useAdminOrders(query: AdminOrdersQuery) {
  return useQuery({
    queryKey: ['admin', 'orders', query],
    queryFn: () => fetchAdminOrders(query),
    staleTime: 15_000,
    placeholderData: (previous) => previous,
  });
}
