import { UploadStatus } from '../enums/upload-status';
import type { UploadedAsset } from '../types/asset';
import type { RetryUploadOptions, UploadProvider } from '../types';
import { runCompressionPipeline } from '../pipeline/compression';
import { generatePreview } from '../pipeline/generate-preview';
import { patchAsset } from '../utils/collection';

export interface RetryUploadResult {
  readonly asset: UploadedAsset;
  readonly success: boolean;
}

/**
 * Retry a failed upload for an existing asset record.
 *
 * Resets status to Uploading, re-runs compression + preview + provider upload.
 */
export async function retryUpload(
  provider: UploadProvider,
  options: RetryUploadOptions,
): Promise<RetryUploadResult> {
  const { asset, file, onProgress } = options;

  if (asset.status !== UploadStatus.Failed && asset.status !== UploadStatus.Idle) {
    return { asset, success: asset.status === UploadStatus.Uploaded };
  }

  let current = patchAsset(asset, {
    status: UploadStatus.Uploading,
    progress: 0,
    error: undefined,
    retryCount: (asset.retryCount ?? 0) + 1,
  });

  onProgress?.(0, current);

  try {
    const compression = await runCompressionPipeline({
      file,
      kind: asset.kind,
      mimeType: asset.mimeType,
    });

    current = patchAsset(current, { progress: 30 });
    onProgress?.(30, current);

    const preview = await generatePreview({
      blob: compression.blob,
      mimeType: compression.mimeType,
      kind: asset.kind,
      filename: asset.filename,
    });

    current = patchAsset(current, { progress: 50, previewUrl: preview.previewUrl });
    onProgress?.(50, current);

    const result = await provider.upload({
      assetId: asset.id,
      filename: asset.filename,
      mimeType: compression.mimeType,
      kind: asset.kind,
      blob: compression.blob,
      onProgress: (p) => {
        const mapped = 50 + Math.round(p * 0.5);
        current = patchAsset(current, { progress: mapped });
        onProgress?.(mapped, current);
      },
    });

    const uploaded = patchAsset(current, {
      status: UploadStatus.Uploaded,
      progress: 100,
      originalUrl: result.originalUrl,
      previewUrl: result.previewUrl ?? preview.previewUrl,
      size: result.size,
      metadata: {
        ...asset.metadata,
        ...compression.metadata,
        ...preview.metadata,
        ...result.metadata,
        provider: provider.name,
      },
    });

    onProgress?.(100, uploaded);
    return { asset: uploaded, success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Retry failed';
    const failed = patchAsset(current, {
      status: UploadStatus.Failed,
      error: message,
    });
    onProgress?.(current.progress, failed);
    return { asset: failed, success: false };
  }
}
