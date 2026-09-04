import { AssetKind } from '../enums/asset-kind';
import {
  DEFAULT_MAX_ASSETS,
  DEFAULT_MAX_FILE_SIZE_BYTES,
  SIZE_LIMITS_BY_KIND,
  SUPPORTED_MIME_TYPES,
  mimeToAssetKind,
  resolveMimeType,
} from '../constants';
import type { FileValidationOptions, FileValidationResult } from '../types/upload';

/**
 * Validate a file before it enters the upload pipeline.
 *
 * Checks MIME type, asset kind, size limits, and collection capacity.
 */
export function validateFile(
  file: File,
  options: FileValidationOptions = {},
): FileValidationResult {
  const errors: string[] = [];
  const mimeType = resolveMimeType(file.name, file.type);
  const kind = mimeToAssetKind(mimeType);

  if (!kind) {
    errors.push(
      `Unsupported file type "${mimeType || file.name}". Allowed: jpg, jpeg, png, webp, mp3, wav, m4a.`,
    );
    return { valid: false, errors, mimeType, kind: null };
  }

  const normalizedMime = mimeType.toLowerCase();
  const isSupportedMime =
    SUPPORTED_MIME_TYPES.includes(normalizedMime as (typeof SUPPORTED_MIME_TYPES)[number]) ||
    normalizedMime.startsWith('image/') ||
    normalizedMime.startsWith('audio/');

  if (!isSupportedMime) {
    errors.push(`MIME type "${mimeType}" is not supported.`);
  }

  if (options.allowedKinds && !options.allowedKinds.includes(kind)) {
    errors.push(`Only ${options.allowedKinds.join(', ')} uploads are allowed here.`);
  }

  const maxByKind = options.maxSizeByKind?.[kind] ?? SIZE_LIMITS_BY_KIND[kind];
  const maxSize = options.maxSizeBytes ?? maxByKind ?? DEFAULT_MAX_FILE_SIZE_BYTES;

  if (file.size > maxSize) {
    const maxMb = (maxSize / (1024 * 1024)).toFixed(1);
    errors.push(`File exceeds maximum size of ${maxMb} MB.`);
  }

  if (file.size === 0) {
    errors.push('File is empty.');
  }

  const maxAssets = options.maxAssets ?? DEFAULT_MAX_ASSETS;
  const currentCount = options.currentAssetCount ?? 0;

  if (currentCount >= maxAssets) {
    errors.push(`Maximum of ${maxAssets} assets allowed.`);
  }

  return {
    valid: errors.length === 0,
    errors,
    mimeType,
    kind,
  };
}

/** Narrow validation to images only. */
export function validateImageFile(
  file: File,
  options: Omit<FileValidationOptions, 'allowedKinds'> = {},
): FileValidationResult {
  return validateFile(file, { ...options, allowedKinds: [AssetKind.Image] });
}

/** Narrow validation to audio only. */
export function validateAudioFile(
  file: File,
  options: Omit<FileValidationOptions, 'allowedKinds'> = {},
): FileValidationResult {
  return validateFile(file, { ...options, allowedKinds: [AssetKind.Audio] });
}
