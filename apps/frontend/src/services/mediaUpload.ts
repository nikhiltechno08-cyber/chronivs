/**
 * Cloudinary media API client — upload / delete / progress.
 * No UI. No studio state. Used by UploadManager.
 */

import { env } from '@/lib/env';

import { ApiError } from './api-client';

export const MEDIA_MAX_BYTES = 15 * 1024 * 1024;

export const MEDIA_ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const;

export const MEDIA_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
] as const;

export type MediaUploadResult = {
  id: string;
  url: string;
  public_id: string;
  width: number | null;
  height: number | null;
  format: string | null;
  bytes: number | null;
};

export type MediaDeleteResult = {
  id: string;
  deleted: boolean;
  public_id: string | null;
};

export type UploadProgressHandler = (progress: number) => void;

export class MediaValidationError extends Error {
  constructor(
    message: string,
    public code: 'invalid_format' | 'file_too_large' | 'empty_file',
  ) {
    super(message);
    this.name = 'MediaValidationError';
  }
}

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf('.');
  return dot >= 0 ? filename.slice(dot).toLowerCase() : '';
}

function extensionFromMime(mime: string): string {
  switch ((mime || '').toLowerCase()) {
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    case 'image/jpeg':
    case 'image/jpg':
      return '.jpg';
    default:
      return '.jpg';
  }
}

/** Ensure multipart always carries a usable filename (some OS picks omit File.name). */
export function resolveUploadFilename(file: File): string {
  const trimmed = (file.name || '').trim();
  const ext = extensionOf(trimmed);
  if (trimmed && (MEDIA_ALLOWED_EXTENSIONS as readonly string[]).includes(ext)) {
    return trimmed;
  }
  return `photo-${Date.now()}${ext || extensionFromMime(file.type)}`;
}

/** Client-side format + size validation before upload. */
export function validateImageFile(file: File): void {
  if (!file || file.size <= 0) {
    throw new MediaValidationError('Please choose a valid image file.', 'empty_file');
  }

  const ext = extensionOf(file.name || '');
  const mime = (file.type || '').toLowerCase();
  const knownMime =
    mime === 'application/octet-stream' ||
    (MEDIA_ALLOWED_MIME_TYPES as readonly string[]).includes(mime);
  const knownExt = (MEDIA_ALLOWED_EXTENSIONS as readonly string[]).includes(ext);

  // Accept when extension or MIME identifies a supported image (name may be empty).
  if (!knownExt && !knownMime) {
    throw new MediaValidationError(
      'Only JPG, JPEG, PNG, and WEBP images are supported.',
      'invalid_format',
    );
  }

  if (file.size > MEDIA_MAX_BYTES) {
    throw new MediaValidationError(
      'That photo is too large. Please use an image under 15MB.',
      'file_too_large',
    );
  }
}

export function fileFingerprint(file: File): string {
  return `${file.name}::${file.size}::${file.lastModified}`;
}

function parseApiError(status: number, raw: string): ApiError {
  try {
    const error = JSON.parse(raw) as {
      message?: string;
      error?: string;
      code?: string;
      detail?: string | Array<{ msg?: string }>;
    };
    const detailMessage = Array.isArray(error.detail)
      ? error.detail.map((d) => d.msg).filter(Boolean).join(', ')
      : typeof error.detail === 'string'
        ? error.detail
        : undefined;
    return new ApiError(
      error.message ?? error.error ?? detailMessage ?? 'Upload failed',
      status,
      error.code,
    );
  } catch {
    return new ApiError(raw || 'Upload failed', status);
  }
}

/**
 * Upload one image via multipart form-data with upload progress.
 */
export function uploadImage(
  file: File,
  options: {
    folder?: string;
    onProgress?: UploadProgressHandler;
    signal?: AbortSignal;
  } = {},
): Promise<MediaUploadResult> {
  validateImageFile(file);

  const { folder = 'general', onProgress, signal } = options;

  return new Promise<MediaUploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    const filename = resolveUploadFilename(file);
    // Third arg sets Content-Disposition filename; also send explicit form field as fallback.
    form.append('file', file, filename);
    form.append('filename', filename);
    form.append('folder', folder);

    const abort = () => {
      xhr.abort();
      reject(new DOMException('Upload cancelled', 'AbortError'));
    };

    if (signal) {
      if (signal.aborted) {
        abort();
        return;
      }
      signal.addEventListener('abort', abort, { once: true });
    }

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !onProgress) return;
      const pct = Math.max(0, Math.min(100, Math.round((event.loaded / event.total) * 100)));
      onProgress(pct);
    };

    xhr.onerror = () => {
      reject(new ApiError('Network error while uploading. Please try again.', 0, 'network_error'));
    };

    xhr.onabort = () => {
      reject(new DOMException('Upload cancelled', 'AbortError'));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as MediaUploadResult);
        } catch {
          reject(new ApiError('Invalid upload response', xhr.status, 'invalid_response'));
        }
        return;
      }
      reject(parseApiError(xhr.status, xhr.responseText));
    };

    xhr.open('POST', `${env.NEXT_PUBLIC_API_URL}/media/upload`);
    xhr.send(form);
  });
}

/** Upload multiple images sequentially (manager handles parallelism). */
export async function uploadMultipleImages(
  files: File[],
  options: {
    folder?: string;
    onFileProgress?: (index: number, progress: number) => void;
    signal?: AbortSignal;
  } = {},
): Promise<MediaUploadResult[]> {
  const results: MediaUploadResult[] = [];
  for (let i = 0; i < files.length; i += 1) {
    const file = files[i]!;
    const result = await uploadImage(file, {
      folder: options.folder,
      signal: options.signal,
      onProgress: (p) => options.onFileProgress?.(i, p),
    });
    results.push(result);
  }
  return results;
}

/** Delete a Cloudinary-backed media record by UUID. */
export async function deleteUploadedImage(
  mediaId: string,
  options: { signal?: AbortSignal } = {},
): Promise<MediaDeleteResult> {
  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/media/${encodeURIComponent(mediaId)}`, {
    method: 'DELETE',
    signal: options.signal,
  });

  if (!response.ok) {
    const raw = await response.text();
    throw parseApiError(response.status, raw);
  }

  return response.json() as Promise<MediaDeleteResult>;
}
