import { AssetKind } from '../enums/asset-kind';

/** Supported image MIME types. */
export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
] as const;

export type ImageMimeType = (typeof IMAGE_MIME_TYPES)[number];

/** Supported audio MIME types. */
export const AUDIO_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/mp4',
  'audio/x-m4a',
  'audio/m4a',
] as const;

export type AudioMimeType = (typeof AUDIO_MIME_TYPES)[number];

/** All supported upload MIME types. */
export const SUPPORTED_MIME_TYPES = [
  ...IMAGE_MIME_TYPES,
  ...AUDIO_MIME_TYPES,
] as const;

export type SupportedMimeType = (typeof SUPPORTED_MIME_TYPES)[number];

/** File extensions mapped to canonical MIME types. */
export const EXTENSION_TO_MIME: Readonly<Record<string, SupportedMimeType>> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  m4a: 'audio/mp4',
};

/** Resolve MIME type from filename extension when browser type is empty. */
export function resolveMimeType(filename: string, reportedType: string): string {
  if (reportedType && reportedType !== 'application/octet-stream') {
    return reportedType.toLowerCase();
  }

  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return EXTENSION_TO_MIME[ext] ?? reportedType;
}

/** Determine asset kind from MIME type. */
export function mimeToAssetKind(mimeType: string): AssetKind | null {
  const normalized = mimeType.toLowerCase();

  if (
    normalized.startsWith('image/') ||
    (IMAGE_MIME_TYPES as readonly string[]).includes(normalized)
  ) {
    return AssetKind.Image;
  }

  if (
    normalized.startsWith('audio/') ||
    (AUDIO_MIME_TYPES as readonly string[]).includes(normalized)
  ) {
    return AssetKind.Audio;
  }

  return null;
}
