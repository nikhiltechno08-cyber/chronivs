'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Pagination } from '@/features/admin/components/Pagination';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';

import { OrderDetailsDrawer } from './components/OrderDetailsDrawer';
import { OrderFilters } from './components/OrderFilters';
import { OrdersEmptyState } from './components/OrdersEmptyState';
import { OrdersSummaryCards } from './components/OrdersSummaryCards';
import { OrdersTable } from './components/OrdersTable';
import { SearchBar } from './components/SearchBar';
import { useAdminOrders } from './hooks/use-admin-orders';
import type { AdminOrderSort, AdminOrderStatusFilter, AdminOrdersQuery } from './types';
import { toIsoDateEnd, toIsoDateStart } from './utils';

function parseQuery(searchParams: URLSearchParams): AdminOrdersQuery {
  return {
    page: Number.parseInt(searchParams.get('page') ?? '1', 10) || 1,
    pageSize: 20,
    q: searchParams.get('q') ?? '',
    status: (searchParams.get('status') as AdminOrderStatusFilter) || 'all',
    occasion: searchParams.get('occasion') ?? '',
    template: searchParams.get('template') ?? '',
    dateFrom: searchParams.get('dateFrom') ?? '',
    dateTo: searchParams.get('dateTo') ?? '',
    sort: (searchParams.get('sort') as AdminOrderSort) || 'newest',
  };
}

function buildSearchParams(query: AdminOrdersQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.page && query.page > 1) params.set('page', String(query.page));
  if (query.q) params.set('q', query.q);
  if (query.status && query.status !== 'all') params.set('status', query.status);
  if (query.occasion) params.set('occasion', query.occasion);
  if (query.template) params.set('template', query.template);
  if (query.dateFrom) params.set('dateFrom', query.dateFrom);
  if (query.dateTo) params.set('dateTo', query.dateTo);
  if (query.sort && query.sort !== 'newest') params.set('sort', query.sort);
  return params;
}

export function AdminOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const uiQuery = useMemo(() => parseQuery(searchParams), [searchParams]);

  const apiQuery = useMemo<AdminOrdersQuery>(
    () => ({
      ...uiQuery,
      dateFrom: toIsoDateStart(uiQuery.dateFrom ?? ''),
      dateTo: toIsoDateEnd(uiQuery.dateTo ?? ''),
    }),
    [uiQuery],
  );

  const { data, isLoading, isError, isFetching } = useAdminOrders(apiQuery);

  const updateQuery = useCallback(
    (patch: Partial<AdminOrdersQuery>) => {
      const next = { ...uiQuery, ...patch };
      if (!patch.page) {
        next.page = 1;
      }
      const params = buildSearchParams(next);
      const suffix = params.toString();
      router.replace(suffix ? `/admin/orders?${suffix}` : '/admin/orders');
    },
    [router, uiQuery],
  );

  const resetFilters = useCallback(() => {
    router.replace('/admin/orders');
  }, [router]);

  const hasFilters =
    Boolean(uiQuery.q) ||
    uiQuery.status !== 'all' ||
    Boolean(uiQuery.occasion) ||
    Boolean(uiQuery.template) ||
    Boolean(uiQuery.dateFrom) ||
    Boolean(uiQuery.dateTo) ||
    uiQuery.sort !== 'newest';

  const showEmptyState = !isLoading && !isError && data?.total === 0 && !hasFilters;
  const showFilteredEmpty = !isLoading && !isError && data?.total === 0 && hasFilters;

  return (
    <div className="admin-page admin-orders-page">
      <AdminPageHeader
        title="Orders"
        description="Manage every purchase made on Chronivs."
      />

      {isLoading && !data ? (
        <div className="admin-dashboard-loading" role="status" aria-live="polite">
          <span className="admin-auth-loading-spinner" aria-hidden="true" />
          <span>Loading orders…</span>
        </div>
      ) : (
        <>
          <OrdersSummaryCards
            summary={
              data?.summary ?? {
                totalOrders: 0,
                completed: 0,
                pending: 0,
                failed: 0,
                todaysOrders: 0,
                todaysRevenue: 0,
                currency: 'INR',
              }
            }
            unavailable={isError}
          />

          <section className="admin-orders-toolbar">
            <SearchBar value={uiQuery.q ?? ''} onChange={(value) => updateQuery({ q: value })} />
            <OrderFilters
              status={uiQuery.status ?? 'all'}
              occasion={uiQuery.occasion ?? ''}
              template={uiQuery.template ?? ''}
              dateFrom={uiQuery.dateFrom ?? ''}
              dateTo={uiQuery.dateTo ?? ''}
              sort={uiQuery.sort ?? 'newest'}
              filterOptions={data?.filterOptions ?? { occasions: [], templates: [] }}
              onStatusChange={(status) => updateQuery({ status })}
              onOccasionChange={(occasion) => updateQuery({ occasion })}
              onTemplateChange={(template) => updateQuery({ template })}
              onDateFromChange={(dateFrom) => updateQuery({ dateFrom })}
              onDateToChange={(dateTo) => updateQuery({ dateTo })}
              onSortChange={(sort) => updateQuery({ sort })}
              onReset={resetFilters}
            />
          </section>

          {isError ? (
            <div className="admin-order-drawer-error" role="alert">
              Unable to load orders. Please refresh and try again.
            </div>
          ) : null}

          {showEmptyState ? <OrdersEmptyState /> : null}

          {showFilteredEmpty ? (
            <div className="admin-orders-filtered-empty">
              <p>No orders match your current filters.</p>
              <button type="button" onClick={resetFilters}>
                Clear filters
              </button>
            </div>
          ) : null}

          {data && data.total > 0 ? (
            <>
              <div className={isFetching ? 'admin-orders-table-shell is-fetching' : 'admin-orders-table-shell'}>
                <OrdersTable orders={data.items} onView={setSelectedOrderId} />
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

      <OrderDetailsDrawer orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />
    </div>
  );
}
