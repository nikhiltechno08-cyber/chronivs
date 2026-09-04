/**
 * @chronivs/experience-core
 *
 * Canonical Experience Domain Model for Chronivs V2.
 *
 * Pure TypeScript — no UI, no React, no runtime framework dependencies.
 * Consumed by backend APIs, publishing pipelines, payment modules, and
 * frontend adapter layers (not integrated directly into templates).
 *
 * @packageDocumentation
 */

// Enums
export {
  ExperienceStatus,
  EXPERIENCE_STATUS_VALUES,
  EDITABLE_STATUSES,
  isExperienceStatus,
  PUBLICLY_ACCESSIBLE_STATUSES,
  Occasion,
  OCCASION_VALUES,
  isOccasion,
  Relationship,
  RELATIONSHIP_VALUES,
  isRelationship,
} from './enums';

// Branded types
export type {
  AudioAssetId,
  ExperienceId,
  ExperienceSlug,
  ISOTimestamp,
  JsonPrimitive,
  JsonValue,
  MediaAssetId,
  OwnerId,
  SceneId,
  TemplateId,
} from './types';

// Models
export type {
  AudioAsset,
  ContentFieldMap,
  ContentFieldValue,
  CreateExperienceInput,
  DraftState,
  Experience,
  ExperienceContent,
  ExperienceMedia,
  ExperienceOwner,
  ExperienceRecipient,
  ExperienceSettings,
  MediaAsset,
  MediaAssetKind,
  Metadata,
  SceneData,
  SceneDataMap,
  ShareSettings,
  Template,
  TemplateCapabilities,
  ThemeSettings,
  UpdateExperienceInput,
  ValidationIssue,
  ValidationResult,
  ValidationSeverity,
} from './models';

export {
  ANONYMOUS_OWNER,
  createValidationIssue,
  createValidationResult,
  DEFAULT_EXPERIENCE_SETTINGS,
  DEFAULT_METADATA,
  DEFAULT_SHARE_SETTINGS,
  DEFAULT_THEME_SETTINGS,
  EMPTY_DRAFT_STATE,
  EMPTY_EXPERIENCE_CONTENT,
  EMPTY_EXPERIENCE_MEDIA,
  EMPTY_RECIPIENT,
  VALIDATION_OK,
} from './models';

// Constants
export {
  AUDIO_ASSET_ID_PREFIX,
  COMMON_CONTENT_FIELD_KEYS,
  DRAFT_SCHEMA_VERSION,
  EXPERIENCE_ID_PATTERN,
  EXPERIENCE_ID_PREFIX,
  EXPERIENCE_SCHEMA_VERSION,
  MEDIA_ASSET_ID_PREFIX,
  SERIALIZATION_TYPE_EXPERIENCE,
  SERIALIZATION_TYPE_KEY,
  SERIALIZATION_VERSION_KEY,
  SLUG_MAX_LENGTH,
  SLUG_MIN_LENGTH,
  SLUG_PATTERN,
  VALIDATION_CODES,
} from './constants';

export type { ValidationCode } from './constants';

// Utilities
export {
  assertExperienceId,
  cloneExperience,
  createExperienceSkeleton,
  deserializeExperience,
  deserializeExperienceObject,
  generateAudioAssetId,
  generateExperienceId,
  generateMediaAssetId,
  generateSlug,
  generateUniqueSlug,
  isExperienceId,
  isValidExperience,
  isValidSlug,
  serializeExperience,
  serializeExperienceToObject,
  validateExperience,
} from './utils';

export type {
  CloneExperienceOptions,
  DeserializeExperienceOptions,
  DeserializeExperienceResult,
  GenerateSlugOptions,
  SerializedExperienceDocument,
  SerializeExperienceOptions,
} from './utils';
