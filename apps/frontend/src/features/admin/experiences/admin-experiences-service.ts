import { getAdminApiBase } from '@/features/admin/constants/api';

import type {
  AdminExperienceDetail,
  AdminExperiencesListResponse,
  AdminExperiencesQuery,
} from './types';

function buildQueryString(params: AdminExperiencesQuery): string {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.pageSize) search.set('page_size', String(params.pageSize));
  if (params.q?.trim()) search.set('q', params.q.trim());
  if (params.occasion?.trim()) search.set('occasion', params.occasion.trim());
  if (params.relationship?.trim()) search.set('relationship', params.relationship.trim());
  if (params.template?.trim()) search.set('template', params.template.trim());
  if (params.status && params.status !== 'all') search.set('status', params.status);
  if (params.dateFrom) search.set('date_from', params.dateFrom);
  if (params.dateTo) search.set('date_to', params.dateTo);
  if (params.sort) search.set('sort', params.sort);
  const query = search.toString();
  return query ? `?${query}` : '';
}

type ExperiencesApiResponse = {
  items: Array<{
    experience_id: string;
    customer: string;
    customer_email?: string | null;
    occasion?: string | null;
    relationship?: string | null;
    template?: string | null;
    status: string;
    experience_status?: string | null;
    published_url?: string | null;
    created_at: string;
  }>;
  total: number;
  page: number;
  page_size: number;
  pages: number;
  summary: {
    published: number;
    draft: number;
    expired: number;
    total: number;
  };
  filter_options: {
    occasions: string[];
    relationships: string[];
    templates: string[];
  };
};

type ExperienceDetailApiResponse = {
  experience_id: string;
  customer: string;
  customer_email?: string | null;
  recipient_name?: string | null;
  occasion?: string | null;
  relationship?: string | null;
  template?: string | null;
  template_slug?: string | null;
  personal_message?: string | null;
  status: string;
  experience_status?: string | null;
  published_url?: string | null;
  public_slug?: string | null;
  payment_reference?: string | null;
  checkout_order_id?: string | null;
  photos: Array<{
    uuid: string;
    url?: string | null;
    cloudinary_public_id?: string | null;
    media_type: string;
    alt_text?: string | null;
  }>;
  created_at: string;
  published_at?: string | null;
};

function mapListResponse(payload: ExperiencesApiResponse): AdminExperiencesListResponse {
  return {
    items: payload.items.map((item) => ({
      experienceId: item.experience_id,
      customer: item.customer,
      customerEmail: item.customer_email,
      occasion: item.occasion,
      relationship: item.relationship,
      template: item.template,
      status: item.status,
      experienceStatus: item.experience_status,
      publishedUrl: item.published_url,
      createdAt: item.created_at,
    })),
    total: payload.total,
    page: payload.page,
    pageSize: payload.page_size,
    pages: payload.pages,
    summary: payload.summary,
    filterOptions: {
      occasions: payload.filter_options.occasions,
      relationships: payload.filter_options.relationships,
      templates: payload.filter_options.templates,
    },
  };
}

function mapDetailResponse(payload: ExperienceDetailApiResponse): AdminExperienceDetail {
  return {
    experienceId: payload.experience_id,
    customer: payload.customer,
    customerEmail: payload.customer_email,
    recipientName: payload.recipient_name,
    occasion: payload.occasion,
    relationship: payload.relationship,
    template: payload.template,
    templateSlug: payload.template_slug,
    personalMessage: payload.personal_message,
    status: payload.status,
    experienceStatus: payload.experience_status,
    publishedUrl: payload.published_url,
    publicSlug: payload.public_slug,
    paymentReference: payload.payment_reference,
    checkoutOrderId: payload.checkout_order_id,
    photos: payload.photos.map((photo) => ({
      uuid: photo.uuid,
      url: photo.url,
      cloudinaryPublicId: photo.cloudinary_public_id,
      mediaType: photo.media_type,
      altText: photo.alt_text,
    })),
    createdAt: payload.created_at,
    publishedAt: payload.published_at,
  };
}

export async function fetchAdminExperiences(
  query: AdminExperiencesQuery = {},
): Promise<AdminExperiencesListResponse> {
  const response = await fetch(`${getAdminApiBase()}/admin/experiences${buildQueryString(query)}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Unable to load experiences');
  }

  const payload = (await response.json()) as ExperiencesApiResponse;
  return mapListResponse(payload);
}

export async function fetchAdminExperienceDetail(experienceId: string): Promise<AdminExperienceDetail> {
  const response = await fetch(`${getAdminApiBase()}/admin/experiences/${experienceId}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Unable to load experience details');
  }

  const payload = (await response.json()) as ExperienceDetailApiResponse;
  return mapDetailResponse(payload);
}
