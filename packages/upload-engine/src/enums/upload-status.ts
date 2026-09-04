/**
 * Lifecycle status of an uploaded or in-progress asset.
 */
export enum UploadStatus {
  /** Asset record created but upload not yet started. */
  Idle = 'idle',
  /** Upload or processing in progress. */
  Uploading = 'uploading',
  /** Successfully stored and ready for use. */
  Uploaded = 'uploaded',
  /** Upload or processing failed — may be retried. */
  Failed = 'failed',
  /** Soft-deleted by user; excluded from active collections. */
  Removed = 'removed',
}

export const UPLOAD_STATUS_VALUES = Object.values(UploadStatus) as readonly UploadStatus[];

export function isUploadStatus(value: unknown): value is UploadStatus {
  return typeof value === 'string' && UPLOAD_STATUS_VALUES.includes(value as UploadStatus);
}

/** Statuses considered active in a media gallery. */
export const ACTIVE_UPLOAD_STATUSES: readonly UploadStatus[] = [
  UploadStatus.Idle,
  UploadStatus.Uploading,
  UploadStatus.Uploaded,
  UploadStatus.Failed,
] as const;
