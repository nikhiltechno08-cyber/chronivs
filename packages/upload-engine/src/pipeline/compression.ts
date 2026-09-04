import { AssetKind } from '../enums/asset-kind';
import type { CompressionInput, CompressionOutput } from '../types/upload';

import { compressAudio } from './compress-audio';
import { compressImage } from './compress-image';

export interface CompressionPipelineOptions {
  readonly skipCompression?: boolean;
}

/**
 * Run the appropriate compression stage for the asset kind.
 */
export async function runCompressionPipeline(
  input: CompressionInput,
  options: CompressionPipelineOptions = {},
): Promise<CompressionOutput> {
  if (options.skipCompression) {
    return {
      blob: input.file,
      mimeType: input.mimeType,
      metadata: { compressed: false, originalSize: input.file.size },
    };
  }

  switch (input.kind) {
    case AssetKind.Image:
      return compressImage(input);
    case AssetKind.Audio:
      return compressAudio(input);
    default:
      return {
        blob: input.file,
        mimeType: input.mimeType,
        metadata: { compressed: false, originalSize: input.file.size },
      };
  }
}

export { compressAudio } from './compress-audio';
export type { AudioCompressionOptions } from './compress-audio';
export { compressImage } from './compress-image';
export type { ImageCompressionOptions } from './compress-image';
