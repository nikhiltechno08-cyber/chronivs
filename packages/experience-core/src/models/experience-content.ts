import type { JsonValue } from '../types';

import type { SceneDataMap } from './scene-data';

/**
 * Generic text field value — null indicates intentionally empty.
 */
export type ContentFieldValue = string | null;

/**
 * Semantic content fields keyed by stable field identifiers.
 * Templates declare which keys they consume; the domain model does not hardcode any.
 *
 * @example
 * ```ts
 * { sender_name: 'Alex', receiver_name: 'Jordan', custom_message: '...' }
 * ```
 */
export type ContentFieldMap = Readonly<Record<string, ContentFieldValue>>;

/**
 * Portable, template-agnostic user-authored content for an experience.
 * All occasion-specific data lives in generic fields and scene payloads.
 */
export interface ExperienceContent {
  /**
   * Cross-scene text fields (names, messages, dates as strings, etc.).
   * Keys are snake_case semantic identifiers, not display labels.
   */
  readonly fields: ContentFieldMap;
  /** Per-scene structured data keyed by scene id. */
  readonly scenes: SceneDataMap;
  /**
   * Extension bucket for forward-compatible fields before they become first-class.
   * Prefer adding keys to `fields` or scene payloads when semantics are known.
   */
  readonly extensions?: Readonly<Record<string, JsonValue>>;
}

/** Empty content — starting point for new experiences. */
export const EMPTY_EXPERIENCE_CONTENT: ExperienceContent = {
  fields: {},
  scenes: {},
} as const;
