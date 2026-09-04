'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Pagination } from '@/features/admin/components/Pagination';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { SearchBar } from '@/features/admin/orders/components/SearchBar';

import { ExperienceDrawer } from './components/ExperienceDrawer';
import { ExperienceFilters } from './components/ExperienceFilters';
import { ExperienceSummaryCards } from './components/ExperienceSummaryCards';
import { ExperienceTable } from './components/ExperienceTable';
import { ExperiencesEmptyState } from './components/ExperiencesEmptyState';
import { useAdminExperiences } from './hooks/use-admin-experiences';
import type {
  AdminExperienceSort,
  AdminExperienceStatusFilter,
  AdminExperiencesQuery,
} from './types';
import { toIsoDateEnd, toIsoDateStart } from './utils';

function parseQuery(searchParams: URLSearchParams): AdminExperiencesQuery {
  return {
    page: Number.parseInt(searchParams.get('page') ?? '1', 10) || 1,
    pageSize: 20,
    q: searchParams.get('q') ?? '',
    occasion: searchParams.get('occasion') ?? '',
    relationship: searchParams.get('relationship') ?? '',
    template: searchParams.get('template') ?? '',
    status: (searchParams.get('status') as AdminExperienceStatusFilter) || 'all',
    dateFrom: searchParams.get('dateFrom') ?? '',
    dateTo: searchParams.get('dateTo') ?? '',
    sort: (searchParams.get('sort') as AdminExperienceSort) || 'newest',
  };
}

function buildSearchParams(query: AdminExperiencesQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.page && query.page > 1) params.set('page', String(query.page));
  if (query.q) params.set('q', query.q);
  if (query.occasion) params.set('occasion', query.occasion);
  if (query.relationship) params.set('relationship', query.relationship);
  if (query.template) params.set('template', query.template);
  if (query.status && query.status !== 'all') params.set('status', query.status);
  if (query.dateFrom) params.set('dateFrom', query.dateFrom);
  if (query.dateTo) params.set('dateTo', query.dateTo);
  if (query.sort && query.sort !== 'newest') params.set('sort', query.sort);
  return params;
}

export function AdminExperiencesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedExperienceId, setSelectedExperienceId] = useState<string | null>(null);

  const uiQuery = useMemo(() => parseQuery(searchParams), [searchParams]);

  const apiQuery = useMemo<AdminExperiencesQuery>(
    () => ({
      ...uiQuery,
      dateFrom: toIsoDateStart(uiQuery.dateFrom ?? ''),
      dateTo: toIsoDateEnd(uiQuery.dateTo ?? ''),
    }),
    [uiQuery],
  );

  const { data, isLoading, isError, isFetching } = useAdminExperiences(apiQuery);

  const updateQuery = useCallback(
    (patch: Partial<AdminExperiencesQuery>) => {
      const next = { ...uiQuery, ...patch };
      if (!patch.page) {
        next.page = 1;
      }
      const params = buildSearchParams(next);
      const suffix = params.toString();
      router.replace(suffix ? `/admin/experiences?${suffix}` : '/admin/experiences');
    },
    [router, uiQuery],
  );

  const resetFilters = useCallback(() => {
    router.replace('/admin/experiences');
  }, [router]);

  const hasFilters =
    Boolean(uiQuery.q) ||
    Boolean(uiQuery.occasion) ||
    Boolean(uiQuery.relationship) ||
    Boolean(uiQuery.template) ||
    uiQuery.status !== 'all' ||
    Boolean(uiQuery.dateFrom) ||
    Boolean(uiQuery.dateTo) ||
    uiQuery.sort !== 'newest';

  const showEmptyState = !isLoading && !isError && data?.total === 0 && !hasFilters;
  const showFilteredEmpty = !isLoading && !isError && data?.total === 0 && hasFilters;

  return (
    <div className="admin-page admin-experiences-page">
      <AdminPageHeader
        title="Experiences"
        description="Manage and monitor all published experiences."
      />

      {isLoading && !data ? (
        <div className="admin-dashboard-loading" role="status" aria-live="polite">
          <span className="admin-auth-loading-spinner" aria-hidden="true" />
          <span>Loading experiences…</span>
        </div>
      ) : (
        <>
          <ExperienceSummaryCards
            summary={
              data?.summary ?? {
                published: 0,
                draft: 0,
                expired: 0,
                total: 0,
              }
            }
            unavailable={isError}
          />

          <section className="admin-orders-toolbar">
            <SearchBar
              value={uiQuery.q ?? ''}
              onChange={(value) => updateQuery({ q: value })}
              placeholder="Search by customer, experience ID, or template…"
            />
            <ExperienceFilters
              occasion={uiQuery.occasion ?? ''}
              relationship={uiQuery.relationship ?? ''}
              template={uiQuery.template ?? ''}
              status={uiQuery.status ?? 'all'}
              dateFrom={uiQuery.dateFrom ?? ''}
              dateTo={uiQuery.dateTo ?? ''}
              sort={uiQuery.sort ?? 'newest'}
              filterOptions={
                data?.filterOptions ?? { occasions: [], relationships: [], templates: [] }
              }
              onOccasionChange={(occasion) => updateQuery({ occasion })}
              onRelationshipChange={(relationship) => updateQuery({ relationship })}
              onTemplateChange={(template) => updateQuery({ template })}
              onStatusChange={(status) => updateQuery({ status })}
              onDateFromChange={(dateFrom) => updateQuery({ dateFrom })}
              onDateToChange={(dateTo) => updateQuery({ dateTo })}
              onSortChange={(sort) => updateQuery({ sort })}
              onReset={resetFilters}
            />
          </section>

          {isError ? (
            <div className="admin-order-drawer-error" role="alert">
              Unable to load experiences. Please refresh and try again.
            </div>
          ) : null}

          {showEmptyState ? <ExperiencesEmptyState /> : null}

          {showFilteredEmpty ? (
            <div className="admin-orders-filtered-empty">
              <p>No experiences match your current filters.</p>
              <button type="button" onClick={resetFilters}>
                Clear filters
              </button>
            </div>
          ) : null}

          {data && data.total > 0 ? (
            <>
              <div
                className={
                  isFetching ? 'admin-orders-table-shell is-fetching' : 'admin-orders-table-shell'
                }
              >
                <ExperienceTable
                  experiences={data.items}
                  onView={setSelectedExperienceId}
                />
              </div>
              <Pagination
                page={data.page}
                pages={data.pages}
                total={data.total}
                pageSize={data.pageSize}
                onPageChange={(page) => updateQuery({ page })}
              />
            </>
          ) : null}
        </>
      )}

      <ExperienceDrawer
        experienceId={selectedExperienceId}
        onClose={() => setSelectedExperienceId(null)}
      />
    </div>
  );
}
