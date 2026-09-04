/**
 * @chronivs/upload-engine
 *
 * Local-first upload orchestration with pluggable storage providers.
 * Architecture phase — no backend, no Cloudinary wiring, no UI changes.
 */

// Enums
export {
  AssetKind,
  ASSET_KIND_VALUES,
  isAssetKind,
  ACTIVE_UPLOAD_STATUSES,
  UploadStatus,
  UPLOAD_STATUS_VALUES,
  isUploadStatus,
} from './enums';

// Types
export type {
  CloudinaryProviderConfig,
  CompressionInput,
  CompressionOutput,
  CreateAssetDraftInput,
  FileValidationOptions,
  FileValidationResult,
  ISOTimestamp,
  PreviewInput,
  PreviewOutput,
  ProviderUploadContext,
  ProviderUploadResult,
  RemoveMediaOptions,
  ReorderMediaOptions,
  RetryUploadOptions,
  UploadAssetId,
  UploadAssetMetadata,
  UploadCollection,
  UploadEngineConfig,
  UploadEngineListener,
  UploadFileOptions,
  UploadProgressCallback,
  UploadProvider,
  UploadResult,
  UploadedAsset,
  UploadedAssetDraft,
} from './types';

// Constants
export {
  AUDIO_COMPRESSION_DEFAULTS,
  AUDIO_MIME_TYPES,
  DEFAULT_MAX_ASSETS,
  DEFAULT_MAX_AUDIO_SIZE_BYTES,
  DEFAULT_MAX_FILE_SIZE_BYTES,
  DEFAULT_MAX_IMAGE_SIZE_BYTES,
  EXTENSION_TO_MIME,
  IMAGE_COMPRESSION_DEFAULTS,
  IMAGE_MIME_TYPES,
  LOCAL_UPLOAD_MS_PER_MB,
  LOCAL_UPLOAD_PROGRESS_INTERVAL_MS,
  SIZE_LIMITS_BY_KIND,
  SUPPORTED_MIME_TYPES,
  mimeToAssetKind,
  resolveMimeType,
} from './constants';
export type { AudioMimeType, ImageMimeType, SupportedMimeType } from './constants';

// Validation
export { validateAudioFile, validateFile, validateImageFile } from './validation';

// Pipeline
export {
  compressAudio,
  compressImage,
  generatePreview,
  runCompressionPipeline,
} from './pipeline';
export type { AudioCompressionOptions, ImageCompressionOptions } from './pipeline';

// Operations
export {
  findAsset,
  purgeRemovedMedia,
  removeMedia,
  reorderMedia,
  reorderMediaById,
  retryUpload,
} from './operations';
export type { RetryUploadResult } from './operations';

// Providers
export {
  CloudinaryUploadProvider,
  LocalUploadProvider,
  createCloudinaryProvider,
} from './providers';
export type { LocalUploadProviderOptions } from './providers';

// Engine
export { UploadEngine, createLocalUploadEngine } from './engine';

// Utils
export {
  blobSize,
  generateUploadAssetId,
  getActiveAssets,
  nowTimestamp,
  patchAsset,
  reindexAssets,
  revokeBlobUrl,
} from './utils';
