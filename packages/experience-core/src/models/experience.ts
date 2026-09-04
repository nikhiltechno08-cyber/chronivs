import type { ExperienceStatus } from '../enums/experience-status';
import type { Occasion } from '../enums/occasion';
import type { Relationship } from '../enums/relationship';
import type { ExperienceId, ExperienceSlug, ISOTimestamp, TemplateId } from '../types';

import type { ExperienceContent } from './experience-content';
import type { ExperienceMedia } from './media-asset';
import type { Metadata } from './metadata';
import type { ExperienceOwner, ExperienceRecipient } from './participant';
import type { ExperienceSettings } from './experience-settings';

/**
 * Root aggregate for a Chronivs cinematic experience.
 *
 * This is the canonical domain entity consumed by backend APIs, preview engines,
 * payment flows, and publishing pipelines. It is intentionally generic — no
 * occasion-specific fields are hardcoded.
 */
export interface Experience {
  /** Globally unique experience identifier. */
  readonly id: ExperienceId;
  /** URL-safe public slug used in share links once published. */
  readonly slug: ExperienceSlug;
  /** Template/recipe identifier determining scene structure and rendering. */
  readonly templateId: TemplateId;
  /** High-level occasion classification. */
  readonly occasion: Occasion;
  /** Relationship between sender and recipient. */
  readonly relationship: Relationship;
  /** Current lifecycle status. */
  readonly status: ExperienceStatus;
  /** ISO-8601 creation timestamp. */
  readonly createdAt: ISOTimestamp;
  /** ISO-8601 last-modification timestamp. */
  readonly updatedAt: ISOTimestamp;
  /** Creator or account owner. */
  readonly owner: ExperienceOwner;
  /** Intended recipient profile. */
  readonly recipient: ExperienceRecipient;
  /** User-authored text fields and per-scene payloads. */
  readonly content: ExperienceContent;
  /** Attached images and audio. */
  readonly media: ExperienceMedia;
  /** Theme, sharing, and nested metadata settings. */
  readonly settings: ExperienceSettings;
  /** Top-level SEO and analytics metadata. */
  readonly metadata: Metadata;
  /**
   * Domain schema version for forward-compatible serialization migrations.
   * Increment when breaking changes are introduced to this interface.
   */
  readonly schemaVersion: number;
}

/**
 * Input type for creating a new experience — server assigns id, slug, timestamps.
 */
export type CreateExperienceInput = Omit<
  Experience,
  'id' | 'slug' | 'createdAt' | 'updatedAt' | 'schemaVersion'
> & {
  readonly id?: ExperienceId;
  readonly slug?: ExperienceSlug;
  readonly schemaVersion?: number;
};

/**
 * Partial update payload — all fields optional except those required by the API layer.
 */
export type UpdateExperienceInput = Partial<
  Omit<Experience, 'id' | 'createdAt' | 'owner'>
> & {
  readonly id: ExperienceId;
};
