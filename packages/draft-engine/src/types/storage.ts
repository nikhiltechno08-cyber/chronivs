import type { Draft, DraftIndex } from './draft';
import type { DraftId } from './branded';

/**
 * Pluggable storage backend for drafts.
 *
 * Swap {@link LocalDraftStorageProvider} for {@link ApiDraftStorageProvider}
 * without changing Studio or the DraftManager API surface.
 */
export interface DraftStorageProvider {
  /** Provider identifier (e.g. `local`, `api`). */
  readonly name: string;

  /** Load the full draft index. */
  loadIndex(): Promise<DraftIndex>;

  /** Persist the full draft index atomically. */
  saveIndex(index: DraftIndex): Promise<void>;

  /** Retrieve a single draft by id. */
  get(id: DraftId): Promise<Draft | null>;

  /** Upsert a single draft. */
  put(draft: Draft): Promise<void>;

  /** Remove a draft permanently. */
  remove(id: DraftId): Promise<void>;

  /** Clear all drafts. */
  clear(): Promise<void>;

  /** List all draft ids. */
  listIds(): Promise<DraftId[]>;
}

/** Future backend provider configuration (architecture stub). */
export interface ApiDraftStorageConfig {
  readonly baseUrl: string;
  readonly getAuthToken?: () => string | null;
  readonly timeoutMs?: number;
}

/** Options for local storage provider. */
export interface LocalDraftStorageOptions {
  /** localStorage key prefix. Default `chronivs-draft-engine`. */
  readonly storageKey?: string;
}

/** Listener for draft manager mutations. */
export type DraftManagerListener = (draft: Draft | null, index: DraftIndex) => void;

/** Draft manager configuration. */
export interface DraftManagerConfig {
  readonly maxHistoryVersions?: number;
  readonly schemaVersion?: number;
  readonly autosaveDebounceMs?: number;
}

/** Options for {@link autosave}. */
export interface AutosaveOptions {
  readonly debounceMs?: number;
  readonly onSave?: (draft: Draft) => void;
  readonly onError?: (error: unknown) => void;
}

/** Handle returned by {@link autosave} for cancellation. */
export interface AutosaveHandle {
  readonly flush: () => Promise<void>;
  readonly cancel: () => void;
  readonly dispose: () => void;
}

/** Options for {@link restore}. */
export interface RestoreOptions {
  readonly version?: number;
  readonly snapshotIndex?: number;
}

/** Serialized wire format. */
export interface SerializedDraftDocument<TPayload = unknown> {
  readonly type: 'chronivs.draft';
  readonly schemaVersion: number;
  readonly draft: Draft<TPayload>;
}

export type {
  Draft,
  DraftIndex,
  DraftPatch,
} from './draft';
export type { DraftHistory } from './history';
export type { DraftMetadata } from './metadata';
export type { DraftSnapshot } from './snapshot';
export type { DraftVersion } from './version';
export type { DraftId, ISOTimestamp } from './branded';
