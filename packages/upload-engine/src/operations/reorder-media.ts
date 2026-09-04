import type { UploadCollection } from '../types/asset';
import type { ReorderMediaOptions } from '../types/upload';
import { getActiveAssets, reindexAssets } from '../utils/collection';

/**
 * Reorder media within a collection by moving one index to another.
 *
 * Returns a new immutable collection with updated `order` fields.
 */
export function reorderMedia(options: ReorderMediaOptions): UploadCollection {
  const { collection, fromIndex, toIndex } = options;
  const active = getActiveAssets(collection);

  if (fromIndex < 0 || fromIndex >= active.length) {
    return collection;
  }

  if (toIndex < 0 || toIndex >= active.length) {
    return collection;
  }

  if (fromIndex === toIndex) {
    return collection;
  }

  const reordered = active.slice();
  const moved = reordered[fromIndex];
  if (!moved) {
    return collection;
  }

  reordered.splice(fromIndex, 1);
  reordered.splice(toIndex, 0, moved);

  const orderMap = new Map<string, number>();
  reordered.forEach((asset, index) => {
    orderMap.set(asset.id, index);
  });

  const updated = collection.map((asset) => {
    const newOrder = orderMap.get(asset.id);
    if (newOrder === undefined) return asset;
    return { ...asset, order: newOrder };
  });

  return reindexAssets(updated);
}

/** Convenience: reorder by asset id instead of index. */
export function reorderMediaById(
  collection: UploadCollection,
  assetId: string,
  toIndex: number,
): UploadCollection {
  const active = getActiveAssets(collection);
  const fromIndex = active.findIndex((a) => a.id === assetId);
  if (fromIndex === -1) return collection;
  return reorderMedia({ collection, fromIndex, toIndex });
}
