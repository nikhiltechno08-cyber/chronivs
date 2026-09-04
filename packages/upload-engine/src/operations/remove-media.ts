import { UploadStatus } from '../enums/upload-status';
import type { UploadedAsset, UploadCollection } from '../types/asset';
import type { RemoveMediaOptions } from '../types/upload';
import { revokeBlobUrl } from '../utils/collection';

/**
 * Soft-remove an asset from the collection.
 *
 * Sets status to {@link UploadStatus.Removed} and optionally revokes blob URLs.
 */
export function removeMedia(options: RemoveMediaOptions): UploadCollection {
  const { collection, assetId, revokeUrls = true } = options;

  return collection.map((asset) => {
    if (asset.id !== assetId) return asset;

    if (revokeUrls) {
      revokeBlobUrl(asset.previewUrl);
      revokeBlobUrl(asset.originalUrl);
    }

    return {
      ...asset,
      status: UploadStatus.Removed,
      previewUrl: revokeUrls ? null : asset.previewUrl,
      originalUrl: revokeUrls ? null : asset.originalUrl,
      progress: 0,
    };
  });
}

/** Hard-remove: filter out removed assets entirely. */
export function purgeRemovedMedia(collection: UploadCollection): UploadCollection {
  return collection.filter((asset) => asset.status !== UploadStatus.Removed);
}

/** Find a single asset by id. */
export function findAsset(
  collection: UploadCollection,
  assetId: string,
): UploadedAsset | undefined {
  return collection.find((asset) => asset.id === assetId);
}
