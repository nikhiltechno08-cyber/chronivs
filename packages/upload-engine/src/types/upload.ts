import type { AssetKind } from '../enums/asset-kind';
import type { UploadAssetId, ISOTimestamp } from './branded';
import type { UploadAssetMetadata, UploadedAsset, UploadCollection } from './asset';

export type { UploadAssetId, ISOTimestamp } from './branded';
export type {
  UploadAssetMetadata,
  UploadedAsset,
  UploadedAssetDraft,
  UploadCollection,
} from './asset';

/** Progress callback during upload lifecycle. */
export type UploadProgressCallback = (progress: number, asset: UploadedAsset) => void;

/** Options when enqueueing a new file upload. */
export interface UploadFileOptions {
  readonly file: File;
  readonly order?: number;
  readonly metadata?: UploadAssetMetadata;
  readonly skipCompression?: boolean;
  readonly onProgress?: UploadProgressCallback;
}

/** Result of a completed upload operation. */
export interface UploadResult {
  readonly asset: UploadedAsset;
  readonly success: boolean;
}

/** Configuration for file validation. */
export interface FileValidationOptions {
  readonly maxSizeBytes?: number;
  readonly maxSizeByKind?: Partial<Record<AssetKind, number>>;
  readonly allowedKinds?: readonly AssetKind[];
  readonly maxAssets?: number;
  readonly currentAssetCount?: number;
}

/** Outcome of {@link validateFile}. */
export interface FileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly mimeType: string;
  readonly kind: AssetKind | null;
}

/** Options for reordering. */
export interface ReorderMediaOptions {
  readonly collection: UploadCollection;
  readonly fromIndex: number;
  readonly toIndex: number;
}

/** Options for removing an asset. */
export interface RemoveMediaOptions {
  readonly collection: UploadCollection;
  readonly assetId: UploadAssetId;
  /** When true, physically revoke blob URLs. Default true. */
  readonly revokeUrls?: boolean;
}

/** Options for retrying a failed upload. */
export interface RetryUploadOptions {
  readonly asset: UploadedAsset;
  readonly file: File;
  readonly onProgress?: UploadProgressCallback;
}

/** Output from a storage provider after upload completes. */
export interface ProviderUploadResult {
  readonly originalUrl: string;
  readonly previewUrl: string | null;
  readonly size: number;
  readonly metadata?: UploadAssetMetadata;
}

/** Context passed to storage providers during upload. */
export interface ProviderUploadContext {
  readonly assetId: UploadAssetId;
  readonly filename: string;
  readonly mimeType: string;
  readonly kind: AssetKind;
  readonly blob: Blob;
  readonly onProgress?: (progress: number) => void;
}

/** Compression pipeline input. */
export interface CompressionInput {
  readonly file: File;
  readonly kind: AssetKind;
  readonly mimeType: string;
}

/** Compression pipeline output. */
export interface CompressionOutput {
  readonly blob: Blob;
  readonly mimeType: string;
  readonly metadata: UploadAssetMetadata;
}

/** Preview generation input. */
export interface PreviewInput {
  readonly blob: Blob;
  readonly mimeType: string;
  readonly kind: AssetKind;
  readonly filename: string;
}

/** Preview generation output. */
export interface PreviewOutput {
  readonly previewUrl: string;
  readonly metadata?: UploadAssetMetadata;
}

/** Listener for upload engine state changes. */
export type UploadEngineListener = (collection: UploadCollection) => void;

/** Engine configuration. */
export interface UploadEngineConfig {
  readonly maxAssets?: number;
  readonly validation?: FileValidationOptions;
  readonly simulateFailureRate?: number;
}

/** Factory input for creating a new asset draft. */
export interface CreateAssetDraftInput {
  readonly id: UploadAssetId;
  readonly filename: string;
  readonly mimeType: string;
  readonly size: number;
  readonly kind: AssetKind;
  readonly order: number;
  readonly metadata?: UploadAssetMetadata;
}

/** Timestamp helper return. */
export type NowTimestamp = ISOTimestamp;
