import { ExperienceStatus } from '../enums/experience-status';
import { EXPERIENCE_SCHEMA_VERSION } from '../constants';
import type { Experience } from '../models/experience';
import { EMPTY_EXPERIENCE_CONTENT } from '../models/experience-content';
import { DEFAULT_EXPERIENCE_SETTINGS } from '../models/experience-settings';
import { EMPTY_EXPERIENCE_MEDIA } from '../models/media-asset';
import { DEFAULT_METADATA } from '../models/metadata';
import { EMPTY_RECIPIENT } from '../models/participant';

import { generateExperienceId } from './generate-id';
import { generateUniqueSlug } from './generate-slug';

export type CloneExperienceOptions = {
  /** When true, assigns a new id and slug. Defaults to true. */
  readonly regenerateIdentity?: boolean;
  /** Override specific fields on the clone. */
  readonly overrides?: Partial<Experience>;
  /** ISO timestamp for createdAt/updatedAt; defaults to now. */
  readonly timestamp?: string;
};

/**
 * Creates a deep copy of an experience with optional identity regeneration.
 *
 * Media and content references are cloned by value — mutating the clone does
 * not affect the source. Asset URLs remain the same (same underlying storage).
 *
 * @param source - Experience to clone
 * @param options - Clone behavior options
 * @returns A new {@link Experience} instance
 */
export function cloneExperience(
  source: Experience,
  options: CloneExperienceOptions = {},
): Experience {
  const regenerateIdentity = options.regenerateIdentity ?? true;
  const now = options.timestamp ?? new Date().toISOString();
  const cloned = deepClone(source);

  const id = regenerateIdentity ? generateExperienceId() : cloned.id;
  const slug = regenerateIdentity
    ? generateUniqueSlug(cloned.slug || cloned.recipient.displayName || 'experience')
    : cloned.slug;

  const result: Experience = {
    ...cloned,
    id,
    slug,
    createdAt: regenerateIdentity ? (now as Experience['createdAt']) : cloned.createdAt,
    updatedAt: now as Experience['updatedAt'],
    content: {
      fields: { ...cloned.content.fields },
      scenes: { ...cloned.content.scenes },
      extensions: cloned.content.extensions ? { ...cloned.content.extensions } : undefined,
    },
    media: {
      images: cloned.media.images.map((img) => ({ ...img, metadata: img.metadata ? { ...img.metadata } : undefined })),
      audio: cloned.media.audio.map((aud) => ({ ...aud, metadata: aud.metadata ? { ...aud.metadata } : undefined })),
    },
    settings: {
      theme: { ...cloned.settings.theme, customTokens: cloned.settings.theme.customTokens ? { ...cloned.settings.theme.customTokens } : undefined },
      share: { ...cloned.settings.share },
      metadata: cloned.settings.metadata ? { ...cloned.settings.metadata } : undefined,
    },
    metadata: {
      ...cloned.metadata,
      tags: cloned.metadata.tags ? [...cloned.metadata.tags] : undefined,
      extensions: cloned.metadata.extensions ? { ...cloned.metadata.extensions } : undefined,
    },
    recipient: {
      ...cloned.recipient,
      extensions: cloned.recipient.extensions ? { ...cloned.recipient.extensions } : undefined,
    },
    owner: { ...cloned.owner },
    schemaVersion: cloned.schemaVersion ?? EXPERIENCE_SCHEMA_VERSION,
    ...options.overrides,
  };

  return result;
}

/**
 * Creates a minimal valid experience skeleton for testing or draft initialization.
 * Caller should populate content and media before publish.
 */
export function createExperienceSkeleton(
  partial: Partial<Experience> & Pick<Experience, 'templateId' | 'occasion' | 'relationship' | 'owner'>,
): Experience {
  const now = new Date().toISOString();

  return {
    id: partial.id ?? generateExperienceId(),
    slug: partial.slug ?? generateUniqueSlug(partial.recipient?.displayName ?? 'experience'),
    templateId: partial.templateId,
    occasion: partial.occasion,
    relationship: partial.relationship,
    status: partial.status ?? ExperienceStatus.Draft,
    createdAt: (partial.createdAt ?? now) as Experience['createdAt'],
    updatedAt: (partial.updatedAt ?? now) as Experience['updatedAt'],
    owner: partial.owner,
    recipient: partial.recipient ?? EMPTY_RECIPIENT,
    content: partial.content ?? EMPTY_EXPERIENCE_CONTENT,
    media: partial.media ?? EMPTY_EXPERIENCE_MEDIA,
    settings: partial.settings ?? DEFAULT_EXPERIENCE_SETTINGS,
    metadata: partial.metadata ?? DEFAULT_METADATA,
    schemaVersion: partial.schemaVersion ?? EXPERIENCE_SCHEMA_VERSION,
  };
}

function deepClone<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}
