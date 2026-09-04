import type { DraftStatus } from '../enums/draft-status';
import type { SyncStatus } from '../enums/sync-status';

import type { DraftId, ISOTimestamp } from './branded';
import type { DraftHistory } from './history';
import type { DraftMetadata } from './metadata';
import type { DraftSnapshot } from './snapshot';

/**
 * Canonical draft record managed by the Draft Engine.
 */
export interface Draft<TPayload = Record<string, unknown>> {
  /** Unique draft identifier. */
  readonly id: DraftId;
  /** Searchable metadata. */
  readonly metadata: DraftMetadata;
  /** Working payload (form state, experience partial, etc.). */
  readonly payload: TPayload;
  /** Latest point-in-time snapshot mirror. */
  readonly snapshot: DraftSnapshot<TPayload>;
  /** Version history for recovery. */
  readonly history: DraftHistory<TPayload>;
  /** Current monotonic version. */
  readonly version: number;
  /** Lifecycle status. */
  readonly status: DraftStatus;
  /** ISO-8601 creation time. */
  readonly createdAt: ISOTimestamp;
  /** ISO-8601 last mutation time. */
  readonly updatedAt: ISOTimestamp;
  /** Whether unsaved local changes exist. */
  readonly isDirty: boolean;
  /** True when device is offline (local-only persistence). */
  readonly offline: boolean;
  /** Sync state for future backend integration. */
  readonly syncStatus: SyncStatus;
  /** Schema version for migrations. */
  readonly schemaVersion: number;
}

/** Mutable draft patch type. */
export type DraftPatch<TPayload> = {
  readonly metadata?: Partial<DraftMetadata>;
  readonly payload?: Partial<TPayload> | TPayload;
  readonly status?: DraftStatus;
  readonly isDirty?: boolean;
  readonly offline?: boolean;
  readonly syncStatus?: SyncStatus;
};

/** Collection index stored by the storage provider. */
export interface DraftIndex {
  drafts: Record<string, Draft>;
  activeDraftId: DraftId | null;
  schemaVersion: number;
}
