import type { Metadata } from './metadata';
import type { ShareSettings } from './share-settings';
import type { ThemeSettings } from './theme-settings';

/**
 * Aggregated user-configurable settings on an experience.
 */
export interface ExperienceSettings {
  /** Visual theme overrides. */
  readonly theme: ThemeSettings;
  /** Sharing and access-control configuration. */
  readonly share: ShareSettings;
  /** SEO and analytics metadata (may duplicate top-level metadata — merge in adapters). */
  readonly metadata?: Metadata;
}

/** Default settings for a newly created experience. */
export const DEFAULT_EXPERIENCE_SETTINGS: ExperienceSettings = {
  theme: { mode: 'auto' },
  share: { isPublic: false, passwordProtected: false, allowDownload: false },
} as const;
