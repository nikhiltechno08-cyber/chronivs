/**
 * Semantic field keys shared across recipes.
 * Maps to {@link ExperienceContent.fields} in @chronivs/experience-core.
 */
export const RECIPE_FIELD_KEYS = {
  SENDER_NAME: 'sender_name',
  RECEIVER_NAME: 'receiver_name',
  CUSTOM_MESSAGE: 'custom_message',
  SPECIAL_DATE: 'special_date',
  LETTER: 'letter',
  PUZZLE_IMAGE: 'puzzle_image',
} as const;

export type RecipeFieldKey = (typeof RECIPE_FIELD_KEYS)[keyof typeof RECIPE_FIELD_KEYS];

/** Media collection keys used in recipe input validation. */
export const RECIPE_MEDIA_KEYS = {
  PHOTOS: 'photos',
  AUDIO: 'audio',
  PUZZLE_IMAGE: 'puzzle_image',
} as const;

/** Stable validation codes for recipe-level checks. */
export const RECIPE_VALIDATION_CODES = {
  RECIPE_NOT_FOUND: 'RECIPE_NOT_FOUND',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
  FIELD_TOO_SHORT: 'FIELD_TOO_SHORT',
  FIELD_TOO_LONG: 'FIELD_TOO_LONG',
  FIELD_PATTERN_MISMATCH: 'FIELD_PATTERN_MISMATCH',
  PHOTOS_BELOW_MIN: 'PHOTOS_BELOW_MIN',
  PHOTOS_ABOVE_MAX: 'PHOTOS_ABOVE_MAX',
  AUDIO_REQUIRED: 'AUDIO_REQUIRED',
  AUDIO_NOT_ALLOWED: 'AUDIO_NOT_ALLOWED',
  PUZZLE_IMAGE_REQUIRED: 'PUZZLE_IMAGE_REQUIRED',
  INVALID_FIELD_TYPE: 'INVALID_FIELD_TYPE',
} as const;

export type RecipeValidationCode =
  (typeof RECIPE_VALIDATION_CODES)[keyof typeof RECIPE_VALIDATION_CODES];

/** Current recipe definition schema version. */
export const RECIPE_SCHEMA_VERSION = 1 as const;

/** Default photo MIME types accepted by the platform. */
export const DEFAULT_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

/** Default audio MIME types accepted by the platform. */
export const DEFAULT_AUDIO_MIME_TYPES = [
  'audio/mpeg',
  'audio/wav',
  'audio/webm',
  'audio/ogg',
  'audio/mp4',
] as const;
