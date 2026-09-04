import { getAdminApiBase } from '@/features/admin/constants/api';

import type { AdminPaymentDetail, AdminPaymentsListResponse, AdminPaymentsQuery } from './types';

function toNumber(value: string | number): number {
  return typeof value === 'number' ? value : Number.parseFloat(value);
}

function buildQueryString(params: AdminPaymentsQuery): string {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.pageSize) search.set('page_size', String(params.pageSize));
  if (params.q?.trim()) search.set('q', params.q.trim());
  if (params.status && params.status !== 'all') search.set('status', params.status);
  if (params.gateway?.trim()) search.set('gateway', params.gateway.trim());
  if (params.dateFrom) search.set('date_from', params.dateFrom);
  if (params.dateTo) search.set('date_to', params.dateTo);
  if (params.sort) search.set('sort', params.sort);
  const query = search.toString();
  return query ? `?${query}` : '';
}

type PaymentsApiResponse = {
  items: Array<{
    record_id: string;
    payment_id?: string | null;
    order_id?: string | null;
    customer: string;
    customer_email?: string | null;
    amount: string | number;
    currency: string;
    payment_method?: string | null;
    status: string;
    raw_status: string;
    gateway: string;
    provider?: string | null;
    experience_id?: string | null;
    created_at: string;
  }>;
  total: number;
  page: number;
  page_size: number;
  pages: number;
  summary: {
    total_revenue: string | number;
    todays_revenue: string | number;
    successful_payments: number;
    pending_payments: number;
    failed_payments: number;
    refunded_payments: number;
    currency: string;
  };
  filter_options: { gateways: string[] };
  active_provider?: string | null;
};

type PaymentDetailApiResponse = {
  record_id: string;
  payment_id?: string | null;
  order_id?: string | null;
  customer: string;
  customer_email?: string | null;
  amount: string | number;
  currency: string;
  payment_method?: string | null;
  status: string;
  raw_status: string;
  gateway: string;
  provider?: string | null;
  transaction_reference?: string | null;
  failure_reason?: string | null;
  experience_id?: string | null;
  experience_name?: string | null;
  experience_url?: string | null;
  verified_at?: string | null;
  created_at: string;
};

function mapListResponse(payload: PaymentsApiResponse): AdminPaymentsListResponse {
  return {
    items: payload.items.map((item) => ({
      recordId: item.record_id,
      paymentId: item.payment_id,
      orderId: item.order_id,
      customer: item.customer,
      customerEmail: item.customer_email,
      amount: toNumber(item.amount),
      currency: item.currency,
      paymentMethod: item.payment_method,
      status: item.status as AdminPaymentsListResponse['items'][number]['status'],
      rawStatus: item.raw_status,
      gateway: item.gateway,
      provider: item.provider,
      experienceId: item.experience_id,
      createdAt: item.created_at,
    })),
    total: payload.total,
    page: payload.page,
    pageSize: payload.page_size,
    pages: payload.pages,
    summary: {
      totalRevenue: toNumber(payload.summary.total_revenue),
      todaysRevenue: toNumber(payload.summary.todays_revenue),
      successfulPayments: payload.summary.successful_payments,
      pendingPayments: payload.summary.pending_payments,
      failedPayments: payload.summary.failed_payments,
      refundedPayments: payload.summary.refunded_payments,
      currency: payload.summary.currency,
    },
    filterOptions: payload.filter_options,
    activeProvider: payload.active_provider,
  };
}

function mapDetailResponse(payload: PaymentDetailApiResponse): AdminPaymentDetail {
  return {
    recordId: payload.record_id,
    paymentId: payload.payment_id,
    orderId: payload.order_id,
    customer: payload.customer,
    customerEmail: payload.customer_email,
    amount: toNumber(payload.amount),
    currency: payload.currency,
    paymentMethod: payload.payment_method,
    status: payload.status as AdminPaymentDetail['status'],
    rawStatus: payload.raw_status,
    gateway: payload.gateway,
    provider: payload.provider,
    transactionReference: payload.transaction_reference,
    failureReason: payload.failure_reason,
    experienceId: payload.experience_id,
    experienceName: payload.experience_name,
    experienceUrl: payload.experience_url,
    verifiedAt: payload.verified_at,
    createdAt: payload.created_at,
  };
}

export async function fetchAdminPayments(
  query: AdminPaymentsQuery = {},
): Promise<AdminPaymentsListResponse> {
  const response = await fetch(`${getAdminApiBase()}/admin/payments${buildQueryString(query)}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Unable to load payments');
  }

  const payload = (await response.json()) as PaymentsApiResponse;
  return mapListResponse(payload);
}

export async function fetchAdminPaymentDetail(recordId: string): Promise<AdminPaymentDetail> {
  const response = await fetch(`${getAdminApiBase()}/admin/payments/${recordId}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Unable to load payment details');
  }

  const payload = (await response.json()) as PaymentDetailApiResponse;
  return mapDetailResponse(payload);
}
