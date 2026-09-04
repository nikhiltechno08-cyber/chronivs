import { ADMIN_ROUTES } from '@/features/admin/constants/routes';

import type { AdminSearchEntityType, AdminSearchResultItem } from './types';

export function buildSearchResultHref(item: AdminSearchResultItem): string {
  const query = encodeURIComponent(item.referenceId);

  switch (item.entityType) {
    case 'order':
      return `${ADMIN_ROUTES.orders}?q=${query}`;
    case 'customer':
      return `${ADMIN_ROUTES.customers}?q=${query}`;
    case 'experience':
      return `${ADMIN_ROUTES.experiences}?q=${query}`;
    case 'payment':
      return `${ADMIN_ROUTES.payments}?q=${query}`;
    default:
      return ADMIN_ROUTES.dashboard;
  }
}

export function getSearchEntityLabel(entityType: AdminSearchEntityType): string {
  switch (entityType) {
    case 'order':
      return 'Order';
    case 'customer':
      return 'Customer';
    case 'experience':
      return 'Experience';
    case 'payment':
      return 'Payment';
    default:
      return 'Result';
  }
}
