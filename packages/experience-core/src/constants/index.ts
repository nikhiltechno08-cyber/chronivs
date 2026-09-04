/** Current domain schema version for {@link Experience} serialization. */
export const EXPERIENCE_SCHEMA_VERSION = 1 as const;

/** Current draft state schema version. */
export const DRAFT_SCHEMA_VERSION = 1 as const;

/** Prefix applied to generated experience identifiers. */
export const EXPERIENCE_ID_PREFIX = 'exp' as const;

/** Prefix applied to generated media asset identifiers. */
export const MEDIA_ASSET_ID_PREFIX = 'med' as const;

/** Prefix applied to generated audio asset identifiers. */
export const AUDIO_ASSET_ID_PREFIX = 'aud' as const;

/** Maximum slug length for URL safety. */
export const SLUG_MAX_LENGTH = 64 as const;

/** Minimum slug length after normalization. */
export const SLUG_MIN_LENGTH = 3 as const;

/** Regular expression for valid slugs (lowercase alphanumeric + hyphens). */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Regular expression for valid experience id format. */
export const EXPERIENCE_ID_PATTERN = /^exp_[a-z0-9]{12,32}$/;

/** Semantic content field keys commonly used across templates (non-exhaustive). */
export const COMMON_CONTENT_FIELD_KEYS = {
  SENDER_NAME: 'sender_name',
  RECEIVER_NAME: 'receiver_name',
  CUSTOM_MESSAGE: 'custom_message',
  SPECIAL_DATE: 'special_date',
} as const;

/** Validation error codes — stable for i18n and logging. */
export const VALIDATION_CODES = {
  MISSING_ID: 'MISSING_ID',
  MISSING_SLUG: 'MISSING_SLUG',
  INVALID_SLUG: 'INVALID_SLUG',
  MISSING_TEMPLATE_ID: 'MISSING_TEMPLATE_ID',
  MISSING_OCCASION: 'MISSING_OCCASION',
  MISSING_RELATIONSHIP: 'MISSING_RELATIONSHIP',
  MISSING_STATUS: 'MISSING_STATUS',
  MISSING_OWNER: 'MISSING_OWNER',
  MISSING_CREATED_AT: 'MISSING_CREATED_AT',
  MISSING_UPDATED_AT: 'MISSING_UPDATED_AT',
  MISSING_CONTENT: 'MISSING_CONTENT',
  MISSING_MEDIA: 'MISSING_MEDIA',
  MISSING_SETTINGS: 'MISSING_SETTINGS',
  INVALID_OCCASION: 'INVALID_OCCASION',
  INVALID_RELATIONSHIP: 'INVALID_RELATIONSHIP',
  INVALID_STATUS: 'INVALID_STATUS',
  INVALID_SCHEMA_VERSION: 'INVALID_SCHEMA_VERSION',
  PUBLISHED_REQUIRES_PUBLIC_OR_URL: 'PUBLISHED_REQUIRES_PUBLIC_OR_URL',
  DESERIALIZE_INVALID_JSON: 'DESERIALIZE_INVALID_JSON',
  DESERIALIZE_INVALID_SHAPE: 'DESERIALIZE_INVALID_SHAPE',
} as const;

export type ValidationCode = (typeof VALIDATION_CODES)[keyof typeof VALIDATION_CODES];

/** JSON key used to identify serialized experience documents. */
export const SERIALIZATION_TYPE_KEY = '@type' as const;

/** Discriminator value for experience documents. */
export const SERIALIZATION_TYPE_EXPERIENCE = 'chronivs.experience' as const;

/** Discriminator value for experience document version field. */
export const SERIALIZATION_VERSION_KEY = '@version' as const;
