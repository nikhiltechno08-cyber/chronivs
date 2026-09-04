import { AssetKind } from '../enums/asset-kind';
import { IMAGE_COMPRESSION_DEFAULTS } from '../constants';
import type { CompressionInput, CompressionOutput } from '../types/upload';

export interface ImageCompressionOptions {
  readonly maxDimension?: number;
  readonly jpegQuality?: number;
  readonly webpQuality?: number;
}

/**
 * Image compression stage of the upload pipeline.
 *
 * Architecture: resizes and re-encodes images locally using Canvas.
 * Cloudinary can replace this stage via provider-side transformations.
 */
export async function compressImage(
  input: CompressionInput,
  options: ImageCompressionOptions = {},
): Promise<CompressionOutput> {
  const { file, mimeType } = input;
  const maxDimension = options.maxDimension ?? IMAGE_COMPRESSION_DEFAULTS.maxDimension;
  const jpegQuality = options.jpegQuality ?? IMAGE_COMPRESSION_DEFAULTS.jpegQuality;
  const webpQuality = options.webpQuality ?? IMAGE_COMPRESSION_DEFAULTS.webpQuality;

  const originalSize = file.size;

  if (input.kind !== AssetKind.Image) {
    return {
      blob: file,
      mimeType,
      metadata: { compressed: false, originalSize },
    };
  }

  try {
    const bitmap = await createImageBitmap(file);
    const longest = Math.max(bitmap.width, bitmap.height);
    const scale = longest > maxDimension ? maxDimension / longest : 1;
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close();
      return {
        blob: file,
        mimeType,
        metadata: { compressed: false, originalSize, width: bitmap.width, height: bitmap.height },
      };
    }

    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const outputMime =
      mimeType === 'image/webp' ? 'image/webp' : 'image/jpeg';
    const quality = outputMime === 'image/webp' ? webpQuality : jpegQuality;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) resolve(result);
          else reject(new Error('Image compression failed'));
        },
        outputMime,
        quality,
      );
    });

    const compressionRatio = originalSize > 0 ? blob.size / originalSize : 1;

    return {
      blob,
      mimeType: outputMime,
      metadata: {
        compressed: true,
        originalSize,
        compressionRatio,
        width,
        height,
      },
    };
  } catch {
    return {
      blob: file,
      mimeType,
      metadata: { compressed: false, originalSize },
    };
  }
}
