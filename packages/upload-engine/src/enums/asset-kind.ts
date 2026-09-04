/**
 * Classification of an upload asset.
 */
export enum AssetKind {
  Image = 'image',
  Audio = 'audio',
}

export const ASSET_KIND_VALUES = Object.values(AssetKind) as readonly AssetKind[];

export function isAssetKind(value: unknown): value is AssetKind {
  return typeof value === 'string' && ASSET_KIND_VALUES.includes(value as AssetKind);
}
