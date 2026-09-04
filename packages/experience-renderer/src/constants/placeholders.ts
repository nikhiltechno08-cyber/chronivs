/** Default placeholder copy when experience data is missing. */
export const DEFAULT_PLACEHOLDERS = {
  receiverName: 'Someone Special',
  senderName: 'From Me',
  message: 'With all my love...',
  letter: 'Every moment with you...',
  specialDate: 'Today',
  occasion: 'A Special Day',
} as const;

/** Empty media fallbacks. */
export const EMPTY_PHOTOS: readonly never[] = [];
export const EMPTY_AUDIO = null;

/** Renderer schema version. */
export const RENDERER_SCHEMA_VERSION = 1;
