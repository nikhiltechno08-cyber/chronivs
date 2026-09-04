'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchAdminExperienceDetail } from '../admin-experiences-service';

export function useAdminExperienceDetail(experienceId: string | null) {
  return useQuery({
    queryKey: ['admin', 'experiences', 'detail', experienceId],
    queryFn: () => fetchAdminExperienceDetail(experienceId as string),
    enabled: Boolean(experienceId),
    staleTime: 15_000,
  });
}
