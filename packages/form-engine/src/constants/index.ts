/** Current form definition schema version. */
export const FORM_SCHEMA_VERSION = 1 as const;

/** Default validation messages — override via i18n adapters in future. */
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required.',
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters.`,
  MAX_LENGTH: (max: number) => `Must be at most ${max} characters.`,
  MIN_FILES: (min: number) => `At least ${min} file(s) required.`,
  MAX_FILES: (max: number) => `Maximum ${max} file(s) allowed.`,
  MAX_FILE_SIZE: (mb: number) => `Each file must be under ${mb} MB.`,
  ALLOWED_TYPES: 'File type is not allowed.',
  PATTERN: 'Value format is invalid.',
} as const;

/** Maps recipe field types to form field types. */
export const RECIPE_TO_FORM_TYPE_MAP = {
  text: 'text',
  textarea: 'textarea',
  date: 'date',
  photo_collection: 'image_upload',
  audio: 'audio_upload',
  image_slot: 'image_upload',
  letter: 'textarea',
} as const;
