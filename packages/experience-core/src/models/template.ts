import type { Occasion } from '../enums/occasion';
import type { Relationship } from '../enums/relationship';
import type { TemplateId } from '../types';

/**
 * Capability flags describing what a template supports.
 * Rendering engines use this for studio step visibility and validation rules.
 */
export interface TemplateCapabilities {
  readonly supportsPhotos?: boolean;
  readonly maxPhotos?: number;
  readonly supportsAudio?: boolean;
  readonly supportsCustomMessage?: boolean;
  readonly supportsSpecialDate?: boolean;
  readonly supportsThemeOverride?: boolean;
  readonly supportsPasswordProtection?: boolean;
}

/**
 * Registry metadata for a cinematic experience template (recipe).
 * This is the domain representation — not the React component registry.
 */
export interface Template {
  /** Stable template identifier (e.g. `proposal-girlfriend`). */
  readonly id: TemplateId;
  /** URL-safe slug for catalog and documentation. */
  readonly slug: string;
  /** Human-readable template name. */
  readonly name: string;
  /** Short marketing or studio description. */
  readonly description?: string;
  /** Occasions this template is valid for. */
  readonly occasions: readonly Occasion[];
  /** Relationships this template supports. */
  readonly relationships: readonly Relationship[];
  /** Semantic version of the template recipe (semver). */
  readonly version: string;
  /** Ordered list of scene ids defining playback sequence. */
  readonly sceneOrder: readonly string[];
  /** Feature flags for studio and validation. */
  readonly capabilities: TemplateCapabilities;
  /** Whether the template is available for new experiences. */
  readonly isActive?: boolean;
  /** ISO-8601 timestamp when the template was last updated. */
  readonly updatedAt?: string;
}
