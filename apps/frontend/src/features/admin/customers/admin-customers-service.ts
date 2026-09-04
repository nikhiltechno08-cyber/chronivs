import { getAdminApiBase } from '@/features/admin/constants/api';

import type { AdminCustomerDetail, AdminCustomersListResponse, AdminCustomersQuery } from './types';

function toNumber(value: string | number): number {
  return typeof value === 'number' ? value : Number.parseFloat(value);
}

function buildQueryString(params: AdminCustomersQuery): string {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.pageSize) search.set('page_size', String(params.pageSize));
  if (params.q?.trim()) search.set('q', params.q.trim());
  if (params.hasOrders && params.hasOrders !== 'all') search.set('has_orders', params.hasOrders);
  if (params.repeatCustomer && params.repeatCustomer !== 'all') {
    search.set('repeat_customer', params.repeatCustomer);
  }
  if (params.dateFrom) search.set('date_from', params.dateFrom);
  if (params.dateTo) search.set('date_to', params.dateTo);
  if (params.sort) search.set('sort', params.sort);
  const query = search.toString();
  return query ? `?${query}` : '';
}

type CustomersApiResponse = {
  items: Array<{
    email: string;
    customer_name: string;
    phone?: string | null;
    total_orders: number;
    total_spent: string | number;
    currency: string;
    latest_purchase?: string | null;
    joined_at: string;
    is_repeat: boolean;
    latest_order_id?: string | null;
    latest_experience_url?: string | null;
  }>;
  total: number;
  page: number;
  page_size: number;
  pages: number;
  summary: {
    total_customers: number;
    new_this_month: number;
    repeat_customers: number;
    total_revenue: string | number;
    currency: string;
  };
};

type CustomerDetailApiResponse = {
  email: string;
  customer_name: string;
  phone?: string | null;
  joined_at: string;
  total_orders: number;
  total_spent: string | number;
  currency: string;
  latest_order_id?: string | null;
  latest_purchase?: string | null;
  latest_experience_url?: string | null;
  uploaded_images_count: number;
  purchase_history: Array<{
    order_id: string;
    amount: string | number;
    currency: string;
    payment_status: string;
    checkout_status: string;
    template?: string | null;
    occasion?: string | null;
    created_at: string;
  }>;
  payment_history: Array<{
    payment_id?: string | null;
    order_id?: string | null;
    amount: string | number;
    currency: string;
    status: string;
    provider?: string | null;
    created_at?: string | null;
  }>;
  experiences: Array<{
    id: string;
    name: string;
    public_url?: string | null;
    published: boolean;
    published_at?: string | null;
    created_at?: string | null;
  }>;
};

function mapListResponse(payload: CustomersApiResponse): AdminCustomersListResponse {
  return {
    items: payload.items.map((item) => ({
      email: item.email,
      customerName: item.customer_name,
      phone: item.phone,
      totalOrders: item.total_orders,
      totalSpent: toNumber(item.total_spent),
      currency: item.currency,
      latestPurchase: item.latest_purchase,
      joinedAt: item.joined_at,
      isRepeat: item.is_repeat,
      latestOrderId: item.latest_order_id,
      latestExperienceUrl: item.latest_experience_url,
    })),
    total: payload.total,
    page: payload.page,
    pageSize: payload.page_size,
    pages: payload.pages,
    summary: {
      totalCustomers: payload.summary.total_customers,
      newThisMonth: payload.summary.new_this_month,
      repeatCustomers: payload.summary.repeat_customers,
      totalRevenue: toNumber(payload.summary.total_revenue),
      currency: payload.summary.currency,
    },
  };
}

function mapDetailResponse(payload: CustomerDetailApiResponse): AdminCustomerDetail {
  return {
    email: payload.email,
    customerName: payload.customer_name,
    phone: payload.phone,
    joinedAt: payload.joined_at,
    totalOrders: payload.total_orders,
    totalSpent: toNumber(payload.total_spent),
    currency: payload.currency,
    latestOrderId: payload.latest_order_id,
    latestPurchase: payload.latest_purchase,
    latestExperienceUrl: payload.latest_experience_url,
    uploadedImagesCount: payload.uploaded_images_count,
    purchaseHistory: payload.purchase_history.map((item) => ({
      orderId: item.order_id,
      amount: toNumber(item.amount),
      currency: item.currency,
      paymentStatus: item.payment_status,
      checkoutStatus: item.checkout_status,
      template: item.template,
      occasion: item.occasion,
      createdAt: item.created_at,
    })),
    paymentHistory: payload.payment_history.map((item) => ({
      paymentId: item.payment_id,
      orderId: item.order_id,
      amount: toNumber(item.amount),
      currency: item.currency,
      status: item.status,
      provider: item.provider,
      createdAt: item.created_at,
    })),
    experiences: payload.experiences.map((item) => ({
      id: item.id,
      name: item.name,
      publicUrl: item.public_url,
      published: item.published,
      publishedAt: item.published_at,
      createdAt: item.created_at,
    })),
  };
}

export async function fetchAdminCustomers(
  query: AdminCustomersQuery = {},
): Promise<AdminCustomersListResponse> {
  const response = await fetch(`${getAdminApiBase()}/admin/customers${buildQueryString(query)}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Unable to load customers');
  }

  const payload = (await response.json()) as CustomersApiResponse;
  return mapListResponse(payload);
}

export async function fetchAdminCustomerDetail(email: string): Promise<AdminCustomerDetail> {
  const response = await fetch(`${getAdminApiBase()}/admin/customers/${encodeURIComponent(email)}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Unable to load customer details');
  }

  const payload = (await response.json()) as CustomerDetailApiResponse;
  return mapDetailResponse(payload);
}
