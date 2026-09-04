import { ACTIVE_UPLOAD_STATUSES } from '../enums/upload-status';
import type { UploadedAsset, UploadCollection } from '../types/asset';

/** Return only non-removed assets in display order. */
export function getActiveAssets(collection: UploadCollection): UploadedAsset[] {
  return collection
    .filter((asset) => ACTIVE_UPLOAD_STATUSES.includes(asset.status))
    .slice()
    .sort((a, b) => a.order - b.order);
}

/** Normalize order indices after mutation. */
export function reindexAssets(assets: UploadedAsset[]): UploadedAsset[] {
  return assets
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((asset, index) => ({ ...asset, order: index }));
}

/** Immutable asset patch helper. */
export function patchAsset(
  asset: UploadedAsset,
  patch: Partial<UploadedAsset>,
): UploadedAsset {
  return { ...asset, ...patch };
}

/** Revoke blob URLs safely. */
export function revokeBlobUrl(url: string | null | undefined): void {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

/** Compute byte size from a Blob. */
export function blobSize(blob: Blob): number {
  return blob.size;
}
