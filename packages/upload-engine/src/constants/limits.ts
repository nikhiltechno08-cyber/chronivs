import { AssetKind } from '../enums/asset-kind';

/** Default maximum file size — 10 MB. */
export const DEFAULT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/** Default maximum image file size — 8 MB. */
export const DEFAULT_MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;

/** Default maximum audio file size — 15 MB. */
export const DEFAULT_MAX_AUDIO_SIZE_BYTES = 15 * 1024 * 1024;

/** Default maximum assets per collection (aligns with Studio MAX_PHOTOS). */
export const DEFAULT_MAX_ASSETS = 5;

/** Image compression defaults (architecture constants — tunable per provider). */
export const IMAGE_COMPRESSION_DEFAULTS = {
  maxDimension: 1280,
  jpegQuality: 0.82,
  webpQuality: 0.85,
} as const;

/** Audio compression defaults (architecture placeholders). */
export const AUDIO_COMPRESSION_DEFAULTS = {
  /** Target bitrate in kbps when a transcoder is wired. */
  targetBitrateKbps: 128,
  /** Pass-through when no transcoder is available. */
  passThroughWhenUnsupported: true,
} as const;

/** Per-kind size limits. */
export const SIZE_LIMITS_BY_KIND: Readonly<Record<AssetKind, number>> = {
  [AssetKind.Image]: DEFAULT_MAX_IMAGE_SIZE_BYTES,
  [AssetKind.Audio]: DEFAULT_MAX_AUDIO_SIZE_BYTES,
};

/** Simulated upload tick interval for local provider (ms). */
export const LOCAL_UPLOAD_PROGRESS_INTERVAL_MS = 80;

/** Simulated upload duration per MB for local provider (ms). */
export const LOCAL_UPLOAD_MS_PER_MB = 200;
