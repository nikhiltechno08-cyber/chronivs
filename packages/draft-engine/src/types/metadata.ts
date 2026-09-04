import type { SyncStatus } from '../enums/sync-status';

import type { DraftId, ISOTimestamp } from './branded';

/**
 * Descriptive metadata for a draft — searchable and sync-friendly.
 */
export interface DraftMetadata {
  /** Human-readable label (e.g. "Birthday for Sarah"). */
  readonly title?: string;
  /** Associated template identifier. */
  readonly templateId?: string;
  /** Occasion key when applicable. */
  readonly occasion?: string;
  /** Linked experience id once published. */
  readonly experienceId?: string;
  /** Owner user id (future auth). */
  readonly userId?: string;
  /** Device id for offline conflict resolution. */
  readonly deviceId?: string;
  /** Free-form tags for filtering. */
  readonly tags?: readonly string[];
  /** Remote etag / revision token for sync. */
  readonly remoteRevision?: string;
  /** Current sync state. */
  readonly syncStatus?: SyncStatus;
  /** Last successful remote sync timestamp. */
  readonly syncedAt?: ISOTimestamp;
  /** Parent draft when cloned. */
  readonly clonedFrom?: DraftId;
  /** Extensible provider-specific fields. */
  readonly [key: string]: unknown;
}
