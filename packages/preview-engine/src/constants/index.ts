/** Default debounce for live preview updates (ms). */
export const DEFAULT_PREVIEW_DEBOUNCE_MS = 120;

/** Fast path for text field keystrokes (ms). */
export const TEXT_FIELD_DEBOUNCE_MS = 80;

/** Media upload debounce (ms). */
export const MEDIA_DEBOUNCE_MS = 200;

/** Preview engine schema version. */
export const PREVIEW_ENGINE_SCHEMA_VERSION = 1;

/** Default fallback photo gradients (matches frontend FALLBACK_PHOTO_GRADIENTS). */
export const DEFAULT_PHOTO_GRADIENTS = [
  'linear-gradient(150deg, #caa08f, #8f5a56 55%, #5c2f3a)',
  'linear-gradient(150deg, #b8907a, #7a4a52 55%, #4a2535)',
  'linear-gradient(150deg, #d4a896, #9a6b62 55%, #6b3540)',
  'linear-gradient(150deg, #c49a88, #855a50 55%, #553040)',
  'linear-gradient(150deg, #e0b8a8, #a07068 55%, #704048)',
] as const;

/** Viewport dimensions for preview modes. */
export const VIEWPORT_DIMENSIONS = {
  desktop: { width: 1280, height: 720, label: 'Desktop' },
  tablet: { width: 834, height: 1194, label: 'Tablet' },
  mobile: { width: 390, height: 844, label: 'Mobile' },
} as const;

/** Global theme change affects scenes with theme prop — resolved at runtime. */
export const GLOBAL_SYNC_CHANNELS = {
  THEME: '__theme__',
  AUDIO: '__audio__',
  TEMPLATE: '__template__',
} as const;

/** Field keys that map to experience content fields. */
export const PAYLOAD_FIELD_KEYS = {
  SENDER_NAME: 'senderName',
  RECEIVER_NAME: 'receiverName',
  SPECIAL_DATE: 'specialDate',
  CUSTOM_MESSAGE: 'customMessage',
  LETTER: 'letter',
  PHOTOS: 'photos',
  AUDIO: 'audio',
  PUZZLE_IMAGE: 'puzzleImage',
  TEMPLATE_ID: 'templateId',
  OCCASION: 'occasion',
  RELATIONSHIP: 'relationship',
  THEME: 'theme',
} as const;
