/** Current draft engine schema version. */
export const DRAFT_ENGINE_SCHEMA_VERSION = 1;

/** Default localStorage key. */
export const DEFAULT_STORAGE_KEY = 'chronivs-draft-engine';

/** Serialization type discriminator. */
export const SERIALIZATION_TYPE_DRAFT = 'chronivs.draft' as const;

/** Default max versions retained in history. */
export const DEFAULT_MAX_HISTORY_VERSIONS = 20;

/** Default autosave debounce (ms). */
export const DEFAULT_AUTOSAVE_DEBOUNCE_MS = 1500;

/** Minimum interval between forced saves (ms). */
export const MIN_SAVE_INTERVAL_MS = 300;

/** Retention window for deleted drafts before purge (ms) — 30 days. */
export const DELETED_DRAFT_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
