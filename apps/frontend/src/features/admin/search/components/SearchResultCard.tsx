'use client';

import { CreditCard, ShoppingBag, Sparkles, Users } from 'lucide-react';

import { cn } from '@chronivs/ui';

import type { AdminSearchEntityType, AdminSearchResultItem } from '../types';

type SearchResultCardProps = {
  item: AdminSearchResultItem;
  active?: boolean;
  onSelect: (item: AdminSearchResultItem) => void;
  onHover: (item: AdminSearchResultItem) => void;
};

const ENTITY_ICONS: Record<AdminSearchEntityType, typeof ShoppingBag> = {
  order: ShoppingBag,
  customer: Users,
  experience: Sparkles,
  payment: CreditCard,
};

const STATUS_LABELS: Record<string, string> = {
  success: 'Success',
  pending: 'Pending',
  failed: 'Failed',
  refunded: 'Refunded',
  completed: 'Completed',
  paid: 'Paid',
  unpaid: 'Unpaid',
  published: 'Published',
  draft: 'Draft',
  expired: 'Expired',
  repeat: 'Repeat',
  customer: 'Customer',
};

function formatStatusLabel(status: string): string {
  const normalized = status.toLowerCase();
  return STATUS_LABELS[normalized] ?? normalized.replace(/_/g, ' ');
}

export function SearchResultCard({ item, active = false, onSelect, onHover }: SearchResultCardProps) {
  const Icon = ENTITY_ICONS[item.entityType] ?? ShoppingBag;
  const statusClass = item.status.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return (
    <button
      type="button"
      className={cn('admin-search-result-card', active && 'is-active')}
      onClick={() => onSelect(item)}
      onMouseEnter={() => onHover(item)}
      role="option"
      aria-selected={active}
    >
      <span className="admin-search-result-icon" aria-hidden="true">
        <Icon />
      </span>
      <span className="admin-search-result-copy">
        <span className="admin-search-result-title">{item.title}</span>
        <span className="admin-search-result-subtitle">{item.subtitle}</span>
      </span>
      <span className={cn('admin-search-result-badge', `is-${statusClass}`)}>
        {formatStatusLabel(item.status)}
      </span>
    </button>
  );
}

export function flattenSearchResults(
  groups: Array<{ items: AdminSearchResultItem[] }>,
): AdminSearchResultItem[] {
  return groups.flatMap((group) => group.items);
}
