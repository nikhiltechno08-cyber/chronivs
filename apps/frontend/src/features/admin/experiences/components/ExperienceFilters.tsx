'use client';

import {
  FilterDateInput,
  FilterPanel,
  FilterResetButton,
  FilterSelect,
} from '@/features/admin/filters';

import type { AdminExperienceFilterOptions, AdminExperienceSort, AdminExperienceStatusFilter } from '../types';

type ExperienceFiltersProps = {
  occasion: string;
  relationship: string;
  template: string;
  status: AdminExperienceStatusFilter;
  dateFrom: string;
  dateTo: string;
  sort: AdminExperienceSort;
  filterOptions: AdminExperienceFilterOptions;
  onOccasionChange: (value: string) => void;
  onRelationshipChange: (value: string) => void;
  onTemplateChange: (value: string) => void;
  onStatusChange: (value: AdminExperienceStatusFilter) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onSortChange: (value: AdminExperienceSort) => void;
  onReset: () => void;
};

const STATUS_OPTIONS: Array<{ value: AdminExperienceStatusFilter; label: string }> = [
  { value: 'all', label: 'All statuses' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'expired', label: 'Expired' },
];

const SORT_OPTIONS: Array<{ value: AdminExperienceSort; label: string }> = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
];

export function ExperienceFilters({
  occasion,
  relationship,
  template,
  status,
  dateFrom,
  dateTo,
  sort,
  filterOptions,
  onOccasionChange,
  onRelationshipChange,
  onTemplateChange,
  onStatusChange,
  onDateFromChange,
  onDateToChange,
  onSortChange,
  onReset,
}: ExperienceFiltersProps) {
  return (
    <FilterPanel className="admin-experience-filters">
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
        label="Relationship"
        value={relationship}
        options={[
          { value: '', label: 'All relationships' },
          ...filterOptions.relationships.map((value) => ({ value, label: value })),
        ]}
        onChange={onRelationshipChange}
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

      <FilterSelect label="Status" value={status} options={STATUS_OPTIONS} onChange={onStatusChange} />
      <FilterDateInput label="Created From" value={dateFrom} onChange={onDateFromChange} />
      <FilterDateInput label="Created To" value={dateTo} onChange={onDateToChange} />
      <FilterSelect label="Sort" value={sort} options={SORT_OPTIONS} onChange={onSortChange} />
      <FilterResetButton onClick={onReset} />
    </FilterPanel>
  );
}
