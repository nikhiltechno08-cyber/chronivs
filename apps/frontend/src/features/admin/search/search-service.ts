import { getAdminApiBase } from '@/features/admin/constants/api';

import type { AdminSearchQuery, AdminSearchResponse } from './types';

function buildQueryString(params: AdminSearchQuery): string {
  const search = new URLSearchParams();
  search.set('q', params.q.trim());
  if (params.limit) search.set('limit', String(params.limit));
  if (params.intent && params.intent !== 'general') search.set('intent', params.intent);
  return `?${search.toString()}`;
}

export async function searchAdminEntities(params: AdminSearchQuery): Promise<AdminSearchResponse> {
  const response = await fetch(`${getAdminApiBase()}/admin/search${buildQueryString(params)}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Unable to search admin records.');
  }

  const payload = (await response.json()) as {
    query: string;
    total: number;
    groups: Array<{
      entity_type: string;
      label: string;
      items: Array<{
        entity_type: string;
        reference_id: string;
        title: string;
        subtitle: string;
        status: string;
      }>;
    }>;
  };

  return {
    query: payload.query,
    total: payload.total,
    groups: payload.groups.map((group) => ({
      entityType: group.entity_type as AdminSearchResponse['groups'][number]['entityType'],
      label: group.label,
      items: group.items.map((item) => ({
        entityType: item.entity_type as AdminSearchResponse['groups'][number]['entityType'],
        referenceId: item.reference_id,
        title: item.title,
        subtitle: item.subtitle,
        status: item.status,
      })),
    })),
  };
}

export const SearchService = {
  search: searchAdminEntities,
};
