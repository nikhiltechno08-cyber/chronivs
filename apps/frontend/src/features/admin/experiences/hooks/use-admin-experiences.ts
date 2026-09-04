'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchAdminExperiences } from '../admin-experiences-service';
import type { AdminExperiencesQuery } from '../types';

export function useAdminExperiences(query: AdminExperiencesQuery) {
  return useQuery({
    queryKey: ['admin', 'experiences', query],
    queryFn: () => fetchAdminExperiences(query),
    staleTime: 15_000,
    placeholderData: (previous) => previous,
  });
}
