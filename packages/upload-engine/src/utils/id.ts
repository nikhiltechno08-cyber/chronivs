import type { ISOTimestamp, UploadAssetId } from '../types/branded';

/**
 * Generate a unique upload asset identifier.
 */
export function generateUploadAssetId(): UploadAssetId {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID() as UploadAssetId;
  }

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `upload_${hex}` as UploadAssetId;
}

/**
 * Current ISO-8601 timestamp.
 */
export function nowTimestamp(): ISOTimestamp {
  return new Date().toISOString() as ISOTimestamp;
}
