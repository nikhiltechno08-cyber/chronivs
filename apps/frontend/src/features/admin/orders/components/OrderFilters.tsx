'use client';

import {
  FilterDateInput,
  FilterPanel,
  FilterResetButton,
  FilterSelect,
} from '@/features/admin/filters';

import type { AdminOrderFilterOptions, AdminOrderSort, AdminOrderStatusFilter } from '../types';

type OrderFiltersProps = {
  status: AdminOrderStatusFilter;
  occasion: string;
  template: string;
  dateFrom: string;
  dateTo: string;
  sort: AdminOrderSort;
  filterOptions: AdminOrderFilterOptions;
  onStatusChange: (value: AdminOrderStatusFilter) => void;
  onOccasionChange: (value: string) => void;
  onTemplateChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onSortChange: (value: AdminOrderSort) => void;
  onReset: () => void;
};

const STATUS_OPTIONS: Array<{ value: AdminOrderStatusFilter; label: string }> = [
  { value: 'all', label: 'All statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
];

const SORT_OPTIONS: Array<{ value: AdminOrderSort; label: string }> = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'highest_amount', label: 'Highest amount' },
  { value: 'lowest_amount', label: 'Lowest amount' },
];

export function OrderFilters({
  status,
  occasion,
  template,
  dateFrom,
  dateTo,
  sort,
  filterOptions,
  onStatusChange,
  onOccasionChange,
  onTemplateChange,
  onDateFromChange,
  onDateToChange,
  onSortChange,
  onReset,
}: OrderFiltersProps) {
  return (
    <FilterPanel>
      <FilterSelect label="Status" value={status} options={STATUS_OPTIONS} onChange={onStatusChange} />

      <FilterSelect
        label="Occasion"
        value={occasion}
        options={[
          { value: '', label: 'All occasions' },
          ...filterOptions.occasions.map((value) => ({ value, label: value })),
        ]}
        onChange={onOccasionChange}
      />

      <FilterSelect
        label="Template"
        value={template}
        options={[
          { value: '', label: 'All templates' },
          ...filterOptions.templates.map((value) => ({ value, label: value })),
        ]}
        onChange={onTemplateChange}
      />

      <FilterDateInput label="From" value={dateFrom} onChange={onDateFromChange} />
      <FilterDateInput label="To" value={dateTo} onChange={onDateToChange} />
      <FilterSelect label="Sort" value={sort} options={SORT_OPTIONS} onChange={onSortChange} />
      <FilterResetButton onClick={onReset} />
    </FilterPanel>
  );
}
