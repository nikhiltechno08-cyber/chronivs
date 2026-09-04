'use client';

import { useQuery } from '@tanstack/react-query';

import { detectSearchIntent } from '../detect-search-intent';
import { searchAdminEntities } from '../search-service';

export function useGlobalSearch(query: string, enabled: boolean) {
  const trimmed = query.trim();
  const intent = detectSearchIntent(trimmed);

  return useQuery({
    queryKey: ['admin', 'search', trimmed, intent],
    queryFn: () =>
      searchAdminEntities({
        q: trimmed,
        limit: 5,
        intent,
      }),
    enabled: enabled && trimmed.length >= 2,
    staleTime: 30_000,
    placeholderData: (previous) => previous,
  });
}
