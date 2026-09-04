/**
 * Lifecycle status of a draft record.
 */
export enum DraftStatus {
  /** Active working draft. */
  Active = 'active',
  /** Archived — hidden from default lists but recoverable. */
  Archived = 'archived',
  /** Soft-deleted — eligible for purge after retention window. */
  Deleted = 'deleted',
}

export const DRAFT_STATUS_VALUES = Object.values(DraftStatus) as readonly DraftStatus[];

export function isDraftStatus(value: unknown): value is DraftStatus {
  return typeof value === 'string' && DRAFT_STATUS_VALUES.includes(value as DraftStatus);
}

/** Statuses visible in default draft listings. */
export const LISTABLE_DRAFT_STATUSES: readonly DraftStatus[] = [
  DraftStatus.Active,
  DraftStatus.Archived,
] as const;
