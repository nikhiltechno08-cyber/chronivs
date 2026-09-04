'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Pagination } from '@/features/admin/components/Pagination';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { SearchBar } from '@/features/admin/orders/components/SearchBar';

import { CustomerDrawer } from './components/CustomerDrawer';
import { CustomerFilters } from './components/CustomerFilters';
import { CustomerSummaryCards } from './components/CustomerSummaryCards';
import { CustomerTable } from './components/CustomerTable';
import { CustomersEmptyState } from './components/CustomersEmptyState';
import { useAdminCustomers } from './hooks/use-admin-customers';
import type {
  AdminCustomerHasOrdersFilter,
  AdminCustomerRepeatFilter,
  AdminCustomerSort,
  AdminCustomersQuery,
} from './types';
import { toIsoDateEnd, toIsoDateStart } from './utils';

function parseQuery(searchParams: URLSearchParams): AdminCustomersQuery {
  return {
    page: Number.parseInt(searchParams.get('page') ?? '1', 10) || 1,
    pageSize: 20,
    q: searchParams.get('q') ?? '',
    hasOrders: (searchParams.get('hasOrders') as AdminCustomerHasOrdersFilter) || 'all',
    repeatCustomer: (searchParams.get('repeatCustomer') as AdminCustomerRepeatFilter) || 'all',
    dateFrom: searchParams.get('dateFrom') ?? '',
    dateTo: searchParams.get('dateTo') ?? '',
    sort: (searchParams.get('sort') as AdminCustomerSort) || 'newest',
  };
}

function buildSearchParams(query: AdminCustomersQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.page && query.page > 1) params.set('page', String(query.page));
  if (query.q) params.set('q', query.q);
  if (query.hasOrders && query.hasOrders !== 'all') params.set('hasOrders', query.hasOrders);
  if (query.repeatCustomer && query.repeatCustomer !== 'all') {
    params.set('repeatCustomer', query.repeatCustomer);
  }
  if (query.dateFrom) params.set('dateFrom', query.dateFrom);
  if (query.dateTo) params.set('dateTo', query.dateTo);
  if (query.sort && query.sort !== 'newest') params.set('sort', query.sort);
  return params;
}

export function AdminCustomersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  const uiQuery = useMemo(() => parseQuery(searchParams), [searchParams]);

  const apiQuery = useMemo<AdminCustomersQuery>(
    () => ({
      ...uiQuery,
      dateFrom: toIsoDateStart(uiQuery.dateFrom ?? ''),
      dateTo: toIsoDateEnd(uiQuery.dateTo ?? ''),
    }),
    [uiQuery],
  );

  const { data, isLoading, isError, isFetching } = useAdminCustomers(apiQuery);

  const updateQuery = useCallback(
    (patch: Partial<AdminCustomersQuery>) => {
      const next = { ...uiQuery, ...patch };
      if (!patch.page) {
        next.page = 1;
      }
      const params = buildSearchParams(next);
      const suffix = params.toString();
      router.replace(suffix ? `/admin/customers?${suffix}` : '/admin/customers');
    },
    [router, uiQuery],
  );

  const resetFilters = useCallback(() => {
    router.replace('/admin/customers');
  }, [router]);

  const hasFilters =
    Boolean(uiQuery.q) ||
    uiQuery.hasOrders !== 'all' ||
    uiQuery.repeatCustomer !== 'all' ||
    Boolean(uiQuery.dateFrom) ||
    Boolean(uiQuery.dateTo) ||
    uiQuery.sort !== 'newest';

  const showEmptyState = !isLoading && !isError && data?.total === 0 && !hasFilters;
  const showFilteredEmpty = !isLoading && !isError && data?.total === 0 && hasFilters;

  return (
    <div className="admin-page admin-customers-page">
      <AdminPageHeader
        title="Customers"
        description="Manage customers and view their purchase history."
      />

      {isLoading && !data ? (
        <div className="admin-dashboard-loading" role="status" aria-live="polite">
          <span className="admin-auth-loading-spinner" aria-hidden="true" />
          <span>Loading customers…</span>
        </div>
      ) : (
        <>
          <CustomerSummaryCards
            summary={
              data?.summary ?? {
                totalCustomers: 0,
                newThisMonth: 0,
                repeatCustomers: 0,
                totalRevenue: 0,
                currency: 'INR',
              }
            }
            unavailable={isError}
          />

          <section className="admin-orders-toolbar">
            <SearchBar
              value={uiQuery.q ?? ''}
              onChange={(value) => updateQuery({ q: value })}
              placeholder="Search by name, email, or phone…"
            />
            <CustomerFilters
              repeatCustomer={uiQuery.repeatCustomer ?? 'all'}
              dateFrom={uiQuery.dateFrom ?? ''}
              dateTo={uiQuery.dateTo ?? ''}
              sort={uiQuery.sort ?? 'newest'}
              onRepeatCustomerChange={(repeatCustomer) => updateQuery({ repeatCustomer })}
              onDateFromChange={(dateFrom) => updateQuery({ dateFrom })}
              onDateToChange={(dateTo) => updateQuery({ dateTo })}
              onSortChange={(sort) => updateQuery({ sort })}
              onReset={resetFilters}
            />
          </section>

          {isError ? (
            <div className="admin-order-drawer-error" role="alert">
              Unable to load customers. Please refresh and try again.
            </div>
          ) : null}

          {showEmptyState ? <CustomersEmptyState /> : null}

          {showFilteredEmpty ? (
            <div className="admin-orders-filtered-empty">
              <p>No customers match your current filters.</p>
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
                <CustomerTable customers={data.items} onView={setSelectedEmail} />
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

      <CustomerDrawer email={selectedEmail} onClose={() => setSelectedEmail(null)} />
    </div>
  );
}
