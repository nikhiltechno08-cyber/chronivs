import { getAdminApiBase } from '@/features/admin/constants/api';

import type {
  AdminOrderDetail,
  AdminOrdersListResponse,
  AdminOrdersQuery,
} from './types';

function toNumber(value: string | number): number {
  return typeof value === 'number' ? value : Number.parseFloat(value);
}

function buildQueryString(params: AdminOrdersQuery): string {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.pageSize) search.set('page_size', String(params.pageSize));
  if (params.q?.trim()) search.set('q', params.q.trim());
  if (params.status && params.status !== 'all') search.set('status', params.status);
  if (params.occasion?.trim()) search.set('occasion', params.occasion.trim());
  if (params.template?.trim()) search.set('template', params.template.trim());
  if (params.dateFrom) search.set('date_from', params.dateFrom);
  if (params.dateTo) search.set('date_to', params.dateTo);
  if (params.sort) search.set('sort', params.sort);
  const query = search.toString();
  return query ? `?${query}` : '';
}

type OrdersApiResponse = {
  items: Array<{
    order_id: string;
    experience_uuid: string;
    customer_name: string;
    email: string;
    occasion?: string | null;
    relationship?: string | null;
    template?: string | null;
    amount: string | number;
    currency: string;
    payment_status: string;
    experience_status?: string | null;
    checkout_status: string;
    payment_id?: string | null;
    experience_url?: string | null;
    published: boolean;
    created_at: string;
  }>;
  total: number;
  page: number;
  page_size: number;
  pages: number;
  summary: {
    total_orders: number;
    completed: number;
    pending: number;
    failed: number;
    todays_orders: number;
    todays_revenue: string | number;
    currency: string;
  };
  filter_options: {
    occasions: string[];
    templates: string[];
  };
};

type OrderDetailApiResponse = {
  order_id: string;
  experience_uuid: string;
  customer_name: string;
  email: string;
  mobile: string;
  occasion?: string | null;
  relationship?: string | null;
  template?: string | null;
  template_slug?: string | null;
  recipient_name?: string | null;
  custom_message?: string | null;
  amount: string | number;
  discount_amount: string | number;
  total: string | number;
  currency: string;
  coupon_code?: string | null;
  payment_status: string;
  checkout_status: string;
  experience_status?: string | null;
  payment_id?: string | null;
  payment_order_id?: string | null;
  payment_provider?: string | null;
  experience_url?: string | null;
  published: boolean;
  published_at?: string | null;
  photos: Array<{
    uuid: string;
    url?: string | null;
    cloudinary_public_id?: string | null;
    media_type: string;
    alt_text?: string | null;
  }>;
  created_at: string;
  updated_at?: string | null;
};

function mapListResponse(payload: OrdersApiResponse): AdminOrdersListResponse {
  return {
    items: payload.items.map((item) => ({
      orderId: item.order_id,
      experienceUuid: item.experience_uuid,
      customerName: item.customer_name,
      email: item.email,
      occasion: item.occasion,
      relationship: item.relationship,
      template: item.template,
      amount: toNumber(item.amount),
      currency: item.currency,
      paymentStatus: item.payment_status,
      experienceStatus: item.experience_status,
      checkoutStatus: item.checkout_status,
      paymentId: item.payment_id,
      experienceUrl: item.experience_url,
      published: item.published,
      createdAt: item.created_at,
    })),
    total: payload.total,
    page: payload.page,
    pageSize: payload.page_size,
    pages: payload.pages,
    summary: {
      totalOrders: payload.summary.total_orders,
      completed: payload.summary.completed,
      pending: payload.summary.pending,
      failed: payload.summary.failed,
      todaysOrders: payload.summary.todays_orders,
      todaysRevenue: toNumber(payload.summary.todays_revenue),
      currency: payload.summary.currency,
    },
    filterOptions: {
      occasions: payload.filter_options.occasions,
      templates: payload.filter_options.templates,
    },
  };
}

function mapDetailResponse(payload: OrderDetailApiResponse): AdminOrderDetail {
  return {
    orderId: payload.order_id,
    experienceUuid: payload.experience_uuid,
    customerName: payload.customer_name,
    email: payload.email,
    mobile: payload.mobile,
    occasion: payload.occasion,
    relationship: payload.relationship,
    template: payload.template,
    templateSlug: payload.template_slug,
    recipientName: payload.recipient_name,
    customMessage: payload.custom_message,
    amount: toNumber(payload.amount),
    discountAmount: toNumber(payload.discount_amount),
    total: toNumber(payload.total),
    currency: payload.currency,
    couponCode: payload.coupon_code,
    paymentStatus: payload.payment_status,
    checkoutStatus: payload.checkout_status,
    experienceStatus: payload.experience_status,
    paymentId: payload.payment_id,
    paymentOrderId: payload.payment_order_id,
    paymentProvider: payload.payment_provider,
    experienceUrl: payload.experience_url,
    published: payload.published,
    publishedAt: payload.published_at,
    photos: payload.photos.map((photo) => ({
      uuid: photo.uuid,
      url: photo.url,
      cloudinaryPublicId: photo.cloudinary_public_id,
      mediaType: photo.media_type,
      altText: photo.alt_text,
    })),
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
  };
}

export async function fetchAdminOrders(query: AdminOrdersQuery = {}): Promise<AdminOrdersListResponse> {
  const response = await fetch(`${getAdminApiBase()}/admin/orders${buildQueryString(query)}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Unable to load orders');
  }

  const payload = (await response.json()) as OrdersApiResponse;
  return mapListResponse(payload);
}

export async function fetchAdminOrderDetail(orderId: string): Promise<AdminOrderDetail> {
  const response = await fetch(`${getAdminApiBase()}/admin/orders/${orderId}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Unable to load order details');
  }

  const payload = (await response.json()) as OrderDetailApiResponse;
  return mapDetailResponse(payload);
}
