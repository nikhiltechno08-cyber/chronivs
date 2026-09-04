'use client';

import {
  FilterDateInput,
  FilterPanel,
  FilterResetButton,
  FilterSelect,
} from '@/features/admin/filters';

import { formatGatewayFilterLabel } from '../payment-display';
import type { AdminPaymentSort, AdminPaymentStatusFilter } from '../types';

type PaymentFiltersProps = {
  status: AdminPaymentStatusFilter;
  gateway: string;
  dateFrom: string;
  dateTo: string;
  sort: AdminPaymentSort;
  gateways: string[];
  onStatusChange: (value: AdminPaymentStatusFilter) => void;
  onGatewayChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onSortChange: (value: AdminPaymentSort) => void;
  onReset: () => void;
};

const STATUS_OPTIONS: Array<{ value: AdminPaymentStatusFilter; label: string }> = [
  { value: 'all', label: 'All statuses' },
  { value: 'success', label: 'Success' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

const AMOUNT_OPTIONS: Array<{ value: AdminPaymentSort; label: string }> = [
  { value: 'newest', label: 'Any amount' },
  { value: 'highest_amount', label: 'Highest first' },
  { value: 'lowest_amount', label: 'Lowest first' },
  { value: 'oldest', label: 'Oldest first' },
];

export function PaymentFilters({
  status,
  gateway,
  dateFrom,
  dateTo,
  sort,
  gateways,
  onStatusChange,
  onGatewayChange,
  onDateFromChange,
  onDateToChange,
  onSortChange,
  onReset,
}: PaymentFiltersProps) {
  return (
    <FilterPanel className="admin-payment-filters">
      <FilterSelect label="Gateway" value={gateway} options={[
        { value: '', label: 'All gateways' },
        ...gateways.map((value) => ({ value, label: formatGatewayFilterLabel(value) })),
      ]} onChange={onGatewayChange} />
      <FilterSelect label="Status" value={status} options={STATUS_OPTIONS} onChange={onStatusChange} />
      <FilterSelect label="Amount" value={sort} options={AMOUNT_OPTIONS} onChange={onSortChange} />
      <FilterDateInput label="From" value={dateFrom} onChange={onDateFromChange} />
      <FilterDateInput label="To" value={dateTo} onChange={onDateToChange} />
      <FilterResetButton onClick={onReset} />
    </FilterPanel>
  );
}
