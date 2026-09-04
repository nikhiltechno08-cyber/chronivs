/**
 * @chronivs/draft-engine
 *
 * Local-first draft persistence with autosave, versioning, and recovery.
 * Architecture phase — no backend, no Studio wiring, no UI changes.
 */

// Enums
export {
  DraftStatus,
  DRAFT_STATUS_VALUES,
  LISTABLE_DRAFT_STATUSES,
  isDraftStatus,
  SyncStatus,
  SYNC_STATUS_VALUES,
  isSyncStatus,
} from './enums';

// Types
export type {
  ApiDraftStorageConfig,
  AutosaveHandle,
  AutosaveOptions,
  Draft,
  DraftHistory,
  DraftId,
  DraftIndex,
  DraftManagerConfig,
  DraftManagerListener,
  DraftMetadata,
  DraftPatch,
  DraftSnapshot,
  DraftStorageProvider,
  DraftVersion,
  ISOTimestamp,
  LocalDraftStorageOptions,
  RestoreOptions,
  SerializedDraftDocument,
} from './types';

// Constants
export {
  DEFAULT_AUTOSAVE_DEBOUNCE_MS,
  DEFAULT_MAX_HISTORY_VERSIONS,
  DEFAULT_STORAGE_KEY,
  DELETED_DRAFT_RETENTION_MS,
  DRAFT_ENGINE_SCHEMA_VERSION,
  MIN_SAVE_INTERVAL_MS,
  SERIALIZATION_TYPE_DRAFT,
} from './constants';

// Utils
export { computeChecksum, generateDraftId, isOffline, mergePayload, nowTimestamp } from './utils';

// Operations
export {
  applyPatch,
  clone,
  createDraft,
  deserialize,
  deserializeObject,
  DraftDeserializationError,
  restore,
  serialize,
  serializeToObject,
} from './operations';
export type { CreateDraftInput, SerializeOptions } from './operations';

// Autosave helpers
export {
  autosave,
  bindAutosaveBeforeUnload,
  bindOfflineDetection,
  clear,
  load,
  save,
} from './autosave';

// Storage providers
export {
  ApiDraftStorageProvider,
  LocalDraftStorageProvider,
  createApiDraftStorage,
  createLocalDraftStorage,
  safeDraftStorage,
} from './storage';

// Manager
export { DraftManager, createLocalDraftManager } from './manager';

// Zustand store factory
export { createDraftStore } from './store';
export type {
  CreateDraftStoreOptions,
  DraftStore,
  DraftStoreActions,
  DraftStoreState,
} from './store';
