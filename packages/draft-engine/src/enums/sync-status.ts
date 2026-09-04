/**
 * Synchronization state for future backend integration.
 */
export enum SyncStatus {
  /** Stored locally only. */
  Local = 'local',
  /** Pending upload to remote. */
  Pending = 'pending',
  /** Successfully synchronized with backend. */
  Synced = 'synced',
  /** Conflict detected during sync — requires resolution. */
  Conflict = 'conflict',
}

export const SYNC_STATUS_VALUES = Object.values(SyncStatus) as readonly SyncStatus[];

export function isSyncStatus(value: unknown): value is SyncStatus {
  return typeof value === 'string' && SYNC_STATUS_VALUES.includes(value as SyncStatus);
}
