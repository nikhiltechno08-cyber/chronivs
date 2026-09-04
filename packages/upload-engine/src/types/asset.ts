import type { AssetKind } from '../enums/asset-kind';
import type { UploadStatus } from '../enums/upload-status';

import type { ISOTimestamp, UploadAssetId } from './branded';

/**
 * Extensible metadata extracted during upload / compression.
 */
export interface UploadAssetMetadata {
  readonly width?: number;
  readonly height?: number;
  readonly durationSeconds?: number;
  readonly compressed?: boolean;
  readonly compressionRatio?: number;
  readonly originalSize?: number;
  readonly provider?: string;
  readonly providerPublicId?: string;
  readonly [key: string]: unknown;
}

/**
 * Canonical uploaded asset record managed by the Upload Engine.
 */
export interface UploadedAsset {
  /** Unique asset identifier. */
  readonly id: UploadAssetId;
  /** Original filename from the user's device. */
  readonly filename: string;
  /** MIME type (e.g. `image/jpeg`, `audio/mpeg`). */
  readonly mimeType: string;
  /** Byte size of the stored asset (post-compression when applicable). */
  readonly size: number;
  /** Thumbnail or waveform preview URL (local blob or CDN). */
  readonly previewUrl: string | null;
  /** Full-resolution or source URL (local blob or CDN). */
  readonly originalUrl: string | null;
  /** Current lifecycle status. */
  readonly status: UploadStatus;
  /** Upload progress 0–100. */
  readonly progress: number;
  /** ISO-8601 creation timestamp. */
  readonly createdAt: ISOTimestamp;
  /** Extracted or provider-specific metadata. */
  readonly metadata: UploadAssetMetadata;
  /** Asset classification. */
  readonly kind: AssetKind;
  /** Display order within a collection (0-based). */
  readonly order: number;
  /** Error message when status is {@link UploadStatus.Failed}. */
  readonly error?: string;
  /** Number of retry attempts so far. */
  readonly retryCount?: number;
}

/** Mutable draft used during upload pipeline updates. */
export type UploadedAssetDraft = {
  -readonly [K in keyof UploadedAsset]: UploadedAsset[K];
};

/** Snapshot of all assets in an upload session. */
export type UploadCollection = readonly UploadedAsset[];
