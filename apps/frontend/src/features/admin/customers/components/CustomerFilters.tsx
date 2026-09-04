'use client';

import {
  FilterDateInput,
  FilterPanel,
  FilterResetButton,
  FilterSelect,
} from '@/features/admin/filters';

import type {
  AdminCustomerRepeatFilter,
  AdminCustomerSort,
} from '../types';

type CustomerFiltersProps = {
  repeatCustomer: AdminCustomerRepeatFilter;
  dateFrom: string;
  dateTo: string;
  sort: AdminCustomerSort;
  onRepeatCustomerChange: (value: AdminCustomerRepeatFilter) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onSortChange: (value: AdminCustomerSort) => void;
  onReset: () => void;
};

const REPEAT_OPTIONS: Array<{ value: AdminCustomerRepeatFilter; label: string }> = [
  { value: 'all', label: 'All customers' },
  { value: 'repeat', label: 'Repeat customers' },
  { value: 'first_time', label: 'First-time customers' },
];

const TOTAL_ORDERS_OPTIONS: Array<{ value: AdminCustomerSort; label: string }> = [
  { value: 'newest', label: 'Default order' },
  { value: 'most_orders', label: 'Most orders' },
  { value: 'highest_spend', label: 'Highest spend' },
  { value: 'latest_purchase', label: 'Latest purchase' },
  { value: 'oldest', label: 'Oldest joined' },
];

export function CustomerFilters({
  repeatCustomer,
  dateFrom,
  dateTo,
  sort,
  onRepeatCustomerChange,
  onDateFromChange,
  onDateToChange,
  onSortChange,
  onReset,
}: CustomerFiltersProps) {
  return (
    <FilterPanel className="admin-customer-filters">
      <FilterSelect
        label="Repeat Customer"
        value={repeatCustomer}
        options={REPEAT_OPTIONS}
        onChange={onRepeatCustomerChange}
      />
      <FilterSelect
        label="Total Orders"
        value={sort}
        options={TOTAL_ORDERS_OPTIONS}
        onChange={onSortChange}
      />
      <FilterDateInput label="Joined From" value={dateFrom} onChange={onDateFromChange} />
      <FilterDateInput label="Joined To" value={dateTo} onChange={onDateToChange} />
      <FilterResetButton onClick={onReset} />
    </FilterPanel>
  );
}
