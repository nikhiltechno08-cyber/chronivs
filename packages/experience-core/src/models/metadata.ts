/**
 * SEO, analytics, and extensible metadata for an experience.
 * Distinct from {@link ShareSettings} which governs access control.
 */
export interface Metadata {
  /** Human-readable title for listings, browser tab, and OG tags. */
  readonly title?: string;
  /** Short description for search and social previews. */
  readonly description?: string;
  /** Free-form tags for search, filtering, and analytics segmentation. */
  readonly tags?: readonly string[];
  /** BCP-47 locale code (e.g. `en-US`). */
  readonly locale?: string;
  /** Campaign or UTM source identifier. */
  readonly campaignId?: string;
  /** Schema version of this metadata block for forward-compatible migrations. */
  readonly schemaVersion?: number;
  /** Extension bucket for modules not yet modeled (analytics IDs, A/B flags, etc.). */
  readonly extensions?: Readonly<Record<string, unknown>>;
}

/** Default empty metadata. */
export const DEFAULT_METADATA: Metadata = {
  locale: 'en-US',
  schemaVersion: 1,
  tags: [],
} as const;
