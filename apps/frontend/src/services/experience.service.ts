/**
 * Experience persistence API layer.
 * Components/hooks must use this — never call fetch directly.
 */

import { createExperience as createEmptyExperience } from '@/lib/createExperience';
import { toBackendExperienceData } from '@/features/experience-engine/adapters/experience-data-adapter';
import { api } from '@/services/api-client';
import type { ExperienceData } from '@/types/experience';

export type ExperienceServiceResponse = {
  id: string;
  uuid: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  template_slug?: string | null;
  template_name?: string | null;
  occasion?: string | null;
  relationship?: string | null;
  title?: string | null;
  preview_version?: number;
  experience_data: Record<string, unknown>;
};

type RawExperienceResponse = {
  uuid: string;
  status: string;
  created_at: string;
  updated_at: string;
  template_slug?: string | null;
  template_name?: string | null;
  occasion?: string | null;
  relationship?: string | null;
  title?: string | null;
  preview_version?: number;
  experience_data: Record<string, unknown>;
};

type DraftCreateResponse = {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  preview_version?: number;
  experience_data: Record<string, unknown>;
};

function normalize(raw: RawExperienceResponse | DraftCreateResponse): ExperienceServiceResponse {
  if ('uuid' in raw) {
    return {
      id: String(raw.uuid),
      uuid: String(raw.uuid),
      status: raw.status,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
      template_slug: raw.template_slug,
      template_name: raw.template_name,
      occasion: raw.occasion,
      relationship: raw.relationship,
      title: raw.title,
      preview_version: raw.preview_version,
      experience_data: raw.experience_data,
    };
  }
  return {
    id: String(raw.id),
    uuid: String(raw.id),
    status: raw.status,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    preview_version: raw.preview_version,
    experience_data: raw.experience_data,
  };
}

function buildCreatePayload(experienceData: ExperienceData) {
  const customerName = experienceData.creator.name?.trim() || null;
  const customerEmail = experienceData.creator.email?.trim() || null;
  const customerMobile = experienceData.creator.phone?.trim() || null;

  return {
    status: 'draft' as const,
    template_slug: experienceData.templateId || null,
    template_name: experienceData.content.title || null,
    occasion: experienceData.occasion || null,
    relationship: experienceData.relationship || null,
    title: experienceData.content.title || null,
    customer_name: customerName && customerName.length >= 2 ? customerName : null,
    customer_email: customerEmail || null,
    customer_mobile: customerMobile || null,
    experience_data: toBackendExperienceData(experienceData),
  };
}

/** Create a draft experience. Returns { id, status, createdAt }. */
export async function createExperience(
  experienceData?: ExperienceData,
): Promise<ExperienceServiceResponse> {
  const doc = experienceData ?? createEmptyExperience();
  const payload = buildCreatePayload(doc);

  try {
    const draft = await api.post<DraftCreateResponse>('/experiences/draft', payload);
    return normalize(draft);
  } catch {
    const created = await api.post<RawExperienceResponse>('/experiences', payload);
    return normalize(created);
  }
}

/** Update an existing draft / experience. */
export async function updateExperience(
  id: string,
  experienceData: ExperienceData,
  extras: {
    status?: string;
    templateSlug?: string | null;
    occasion?: string | null;
    relationship?: string | null;
  } = {},
): Promise<ExperienceServiceResponse> {
  const nextVersion = (experienceData.metadata.version || 1) + 1;
  const payload = {
    template_slug: (extras.templateSlug ?? experienceData.templateId) || null,
    template_name: experienceData.content.title || null,
    occasion: (extras.occasion ?? experienceData.occasion) || null,
    relationship: (extras.relationship ?? experienceData.relationship) || null,
    title: experienceData.content.title || null,
    status: extras.status,
    experience_data: toBackendExperienceData({
      ...experienceData,
      experienceId: id,
      metadata: {
        ...experienceData.metadata,
        updatedAt: new Date().toISOString(),
        version: nextVersion,
      },
    }),
  };

  const updated = await api.put<RawExperienceResponse>(
    `/experiences/${encodeURIComponent(id)}`,
    payload,
  );
  return normalize(updated);
}

/** Load a complete experience (including experience_data / media URLs). */
export async function getExperience(id: string): Promise<ExperienceServiceResponse> {
  const raw = await api.get<RawExperienceResponse>(`/experiences/${encodeURIComponent(id)}`);
  return normalize(raw);
}

/** Soft-delete / archive experience. */
export async function deleteExperience(id: string): Promise<ExperienceServiceResponse> {
  const raw = await api.delete<RawExperienceResponse>(`/experiences/${encodeURIComponent(id)}`);
  return normalize(raw);
}
