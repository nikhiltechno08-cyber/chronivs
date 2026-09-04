import type { Occasion } from '@chronivs/experience-core';
import type { Relationship } from '@chronivs/experience-core';
import type { TemplateId } from '@chronivs/experience-core';

/**
 * Supported input types for recipe fields.
 * Studio and backend adapters map these to concrete form controls — not defined here.
 */
export type RecipeFieldType =
  | 'text'
  | 'textarea'
  | 'date'
  | 'photo_collection'
  | 'audio'
  | 'image_slot'
  | 'letter';

/**
 * Declarative description of a single user-input field required or optional for a recipe.
 * Does not define UI widgets — only metadata for validation and adapter mapping.
 */
export interface RecipeField {
  /** Stable key stored in experience content (snake_case). */
  readonly key: string;
  /** Input type classification for adapter layers. */
  readonly type: RecipeFieldType;
  /** Human-readable label for studio/API documentation. */
  readonly label: string;
  /** Optional helper text describing intent or format. */
  readonly description?: string;
  /** Scene ids that consume this field (informational for adapters). */
  readonly consumedByScenes?: readonly string[];
  /** Maximum character length for text fields. */
  readonly maxLength?: number;
  /** Minimum character length when present. */
  readonly minLength?: number;
  /** Placeholder hint (metadata only). */
  readonly placeholder?: string;
  /** Regex pattern string for validation (applied when field has a value). */
  readonly pattern?: string;
}

/**
 * Limits and requirements for media attachments on a recipe.
 */
export interface RecipeMediaLimits {
  /** Maximum number of photos allowed. */
  readonly maxPhotos: number;
  /** Minimum photos required for a valid submission (0 = optional collection). */
  readonly minPhotos: number;
  /** Maximum audio tracks (0 = audio not supported). */
  readonly maxAudioTracks: number;
  /** Minimum audio tracks required (0 or 1 typical). */
  readonly minAudioTracks: number;
  /** Whether a dedicated puzzle/feature image slot is required. */
  readonly requiresPuzzleImage: boolean;
  /** Accepted image MIME types. */
  readonly acceptedImageMimeTypes: readonly string[];
  /** Accepted audio MIME types. */
  readonly acceptedAudioMimeTypes: readonly string[];
  /** Max byte size per photo (optional enforcement hint). */
  readonly maxPhotoBytes?: number;
  /** Max byte size per audio file (optional enforcement hint). */
  readonly maxAudioBytes?: number;
}

/**
 * Declarative validation rule evaluated against recipe input.
 */
export type RecipeValidationRuleType =
  | 'required'
  | 'min_length'
  | 'max_length'
  | 'min_items'
  | 'max_items'
  | 'pattern';

/**
 * A single machine-readable validation rule for a recipe.
 */
export interface RecipeValidationRule {
  /** Stable rule code for i18n. */
  readonly code: string;
  /** Target field key or media key (`photos`, `audio`, `puzzle_image`). */
  readonly target: string;
  /** Rule discriminator. */
  readonly rule: RecipeValidationRuleType;
  /** Rule parameter (length, count, or regex pattern string). */
  readonly value?: number | string;
  /** Human-readable failure message. */
  readonly message: string;
}

/**
 * Theme preset reference — opaque to this layer; rendering maps preset id to tokens.
 */
export interface RecipeTheme {
  /** Named theme preset id (e.g. `romantic-plum`, `golden-parchment`). */
  readonly presetId: string;
  /** Default color mode hint. */
  readonly defaultMode?: 'light' | 'dark' | 'auto';
}

/**
 * Optional ambient music configuration for a recipe.
 */
export interface RecipeMusic {
  /** Catalog track id or null when template is silent by default. */
  readonly trackId: string | null;
  /** Whether user-uploaded audio replaces the default track. */
  readonly allowsUserOverride: boolean;
}

/**
 * Ordered scene entry in a recipe playback sequence.
 */
export interface RecipeSceneEntry {
  /** Scene identifier matching the template engine scene registry. */
  readonly sceneId: string;
  /** Optional display label for studio preview timelines. */
  readonly label?: string;
  /** Whether the scene can be disabled without breaking the narrative. */
  readonly optional?: boolean;
}

/**
 * Default values seeded when a new experience is created from this recipe.
 * Keys match {@link RecipeField.key} or media slots.
 */
export type RecipeDefaultValues = Readonly<
  Record<string, string | null | readonly string[]>
>;

/**
 * Complete declarative definition of a Chronivs experience template (recipe).
 * One recipe file per template — no hardcoded forms.
 */
export interface Recipe {
  /** Schema version for forward-compatible migrations. */
  readonly schemaVersion: number;
  /** Template identifier — matches experience.templateId. */
  readonly templateId: TemplateId;
  /** Primary occasion classification. */
  readonly occasion: Occasion;
  /** Supported relationships for this recipe. */
  readonly relationships: readonly Relationship[];
  /** Marketing/studio display name. */
  readonly displayName: string;
  /** Short description of the cinematic experience. */
  readonly description: string;
  /** Estimated playback duration (human-readable, e.g. `8–12 min`). */
  readonly estimatedDuration: string;
  /** Cover image path or CDN key for catalog cards. */
  readonly coverImage: string;
  /** Theme preset reference. */
  readonly theme: RecipeTheme;
  /** Default ambient music configuration. */
  readonly music: RecipeMusic;
  /** Fields that must be provided before preview/publish. */
  readonly requiredFields: readonly RecipeField[];
  /** Fields that enhance but do not block preview. */
  readonly optionalFields: readonly RecipeField[];
  /** Media attachment limits. */
  readonly mediaLimits: RecipeMediaLimits;
  /** Declarative validation rules (derived + explicit). */
  readonly validationRules: readonly RecipeValidationRule[];
  /** Default values for new experiences. */
  readonly defaultValues: RecipeDefaultValues;
  /** Ordered cinematic scene sequence. */
  readonly sceneSequence: readonly RecipeSceneEntry[];
  /** Recipe semver aligned with template implementation. */
  readonly version: string;
  /** Whether new experiences can be created from this recipe. */
  readonly isActive: boolean;
}

/**
 * Generic input payload validated against a recipe.
 * Adapter layers map Studio state or API bodies into this shape.
 */
export interface RecipeInput {
  /** Text field values keyed by {@link RecipeField.key}. */
  readonly fields: Readonly<Record<string, string | null | undefined>>;
  /** Ordered photo URLs or storage keys. */
  readonly photos?: readonly string[];
  /** Voice message or uploaded audio URL/key. */
  readonly audio?: string | null;
  /** Dedicated puzzle or feature image URL/key. */
  readonly puzzleImage?: string | null;
}

/**
 * Outcome of validating {@link RecipeInput} against a {@link Recipe}.
 */
export interface RecipeValidationResult {
  readonly valid: boolean;
  readonly errors: readonly RecipeValidationIssue[];
  readonly warnings: readonly RecipeValidationIssue[];
}

/**
 * A single validation issue from {@link validateRecipe}.
 */
export interface RecipeValidationIssue {
  readonly code: string;
  readonly message: string;
  readonly target?: string;
  readonly severity: 'error' | 'warning';
}
