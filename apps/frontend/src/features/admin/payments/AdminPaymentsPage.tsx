'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Pagination } from '@/features/admin/components/Pagination';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { SearchBar } from '@/features/admin/orders/components/SearchBar';

import { PaymentDrawer } from './components/PaymentDrawer';
import { PaymentFilters } from './components/PaymentFilters';
import { PaymentSummaryCards } from './components/PaymentSummaryCards';
import { PaymentTable } from './components/PaymentTable';
import { PaymentsEmptyState } from './components/PaymentsEmptyState';
import { useAdminPayments } from './hooks/use-admin-payments';
import type { AdminPaymentSort, AdminPaymentStatusFilter, AdminPaymentsQuery } from './types';
import { toIsoDateEnd, toIsoDateStart } from './utils';

function parseQuery(searchParams: URLSearchParams): AdminPaymentsQuery {
  return {
    page: Number.parseInt(searchParams.get('page') ?? '1', 10) || 1,
    pageSize: 20,
    q: searchParams.get('q') ?? '',
    status: (searchParams.get('status') as AdminPaymentStatusFilter) || 'all',
    gateway: searchParams.get('gateway') ?? '',
    dateFrom: searchParams.get('dateFrom') ?? '',
    dateTo: searchParams.get('dateTo') ?? '',
    sort: (searchParams.get('sort') as AdminPaymentSort) || 'newest',
  };
}

function buildSearchParams(query: AdminPaymentsQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.page && query.page > 1) params.set('page', String(query.page));
  if (query.q) params.set('q', query.q);
  if (query.status && query.status !== 'all') params.set('status', query.status);
  if (query.gateway) params.set('gateway', query.gateway);
  if (query.dateFrom) params.set('dateFrom', query.dateFrom);
  if (query.dateTo) params.set('dateTo', query.dateTo);
  if (query.sort && query.sort !== 'newest') params.set('sort', query.sort);
  return params;
}

export function AdminPaymentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  const uiQuery = useMemo(() => parseQuery(searchParams), [searchParams]);

  const apiQuery = useMemo<AdminPaymentsQuery>(
    () => ({
      ...uiQuery,
      dateFrom: toIsoDateStart(uiQuery.dateFrom ?? ''),
      dateTo: toIsoDateEnd(uiQuery.dateTo ?? ''),
    }),
    [uiQuery],
  );

  const { data, isLoading, isError, isFetching } = useAdminPayments(apiQuery);

  const updateQuery = useCallback(
    (patch: Partial<AdminPaymentsQuery>) => {
      const next = { ...uiQuery, ...patch };
      if (!patch.page) {
        next.page = 1;
      }
      const params = buildSearchParams(next);
      const suffix = params.toString();
      router.replace(suffix ? `/admin/payments?${suffix}` : '/admin/payments');
    },
    [router, uiQuery],
  );

  const resetFilters = useCallback(() => {
    router.replace('/admin/payments');
  }, [router]);

  const hasFilters =
    Boolean(uiQuery.q) ||
    uiQuery.status !== 'all' ||
    Boolean(uiQuery.gateway) ||
    Boolean(uiQuery.dateFrom) ||
    Boolean(uiQuery.dateTo) ||
    uiQuery.sort !== 'newest';

  const showEmptyState = !isLoading && !isError && data?.total === 0 && !hasFilters;
  const showFilteredEmpty = !isLoading && !isError && data?.total === 0 && hasFilters;

  return (
    <div className="admin-page admin-payments-page">
      <AdminPageHeader
        title="Payments"
        description="Monitor every payment processed by Chronivs."
      />

      {isLoading && !data ? (
        <div className="admin-dashboard-loading" role="status" aria-live="polite">
          <span className="admin-auth-loading-spinner" aria-hidden="true" />
          <span>Loading payments…</span>
        </div>
      ) : (
        <>
          <PaymentSummaryCards
            summary={
              data?.summary ?? {
                totalRevenue: 0,
                todaysRevenue: 0,
                successfulPayments: 0,
                pendingPayments: 0,
                failedPayments: 0,
                refundedPayments: 0,
                currency: 'INR',
              }
            }
            unavailable={isError}
          />

          <section className="admin-orders-toolbar">
            <SearchBar
              value={uiQuery.q ?? ''}
              onChange={(value) => updateQuery({ q: value })}
              placeholder="Search by payment ID, order ID, customer, or email…"
            />
            <PaymentFilters
              status={uiQuery.status ?? 'all'}
              gateway={uiQuery.gateway ?? ''}
              dateFrom={uiQuery.dateFrom ?? ''}
              dateTo={uiQuery.dateTo ?? ''}
              sort={uiQuery.sort ?? 'newest'}
              gateways={data?.filterOptions.gateways ?? []}
              onStatusChange={(status) => updateQuery({ status })}
              onGatewayChange={(gateway) => updateQuery({ gateway })}
              onDateFromChange={(dateFrom) => updateQuery({ dateFrom })}
              onDateToChange={(dateTo) => updateQuery({ dateTo })}
              onSortChange={(sort) => updateQuery({ sort })}
              onReset={resetFilters}
            />
          </section>

          {isError ? (
            <div className="admin-order-drawer-error" role="alert">
              Unable to load payments. Please refresh and try again.
            </div>
          ) : null}

          {showEmptyState ? <PaymentsEmptyState /> : null}

          {showFilteredEmpty ? (
            <div className="admin-orders-filtered-empty">
              <p>No payments match your current filters.</p>
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
                <PaymentTable payments={data.items} onView={setSelectedRecordId} />
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

      <PaymentDrawer recordId={selectedRecordId} onClose={() => setSelectedRecordId(null)} />
    </div>
  );
}
