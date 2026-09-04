import { AssetKind } from '../enums/asset-kind';
import type { PreviewInput, PreviewOutput } from '../types/upload';

const PREVIEW_MAX_DIMENSION = 320;

/**
 * Generate a preview URL for an uploaded asset.
 *
 * Images: scaled thumbnail blob URL.
 * Audio: placeholder waveform URL (original blob URL until waveform renderer is wired).
 */
export async function generatePreview(input: PreviewInput): Promise<PreviewOutput> {
  if (input.kind === AssetKind.Image) {
    return generateImagePreview(input);
  }

  if (input.kind === AssetKind.Audio) {
    return generateAudioPreview(input);
  }

  return {
    previewUrl: URL.createObjectURL(input.blob),
  };
}

async function generateImagePreview(input: PreviewInput): Promise<PreviewOutput> {
  try {
    const bitmap = await createImageBitmap(input.blob);
    const longest = Math.max(bitmap.width, bitmap.height);
    const scale = longest > PREVIEW_MAX_DIMENSION ? PREVIEW_MAX_DIMENSION / longest : 1;
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close();
      return { previewUrl: URL.createObjectURL(input.blob), metadata: { width, height } };
    }

    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const previewBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) resolve(result);
          else reject(new Error('Preview generation failed'));
        },
        'image/jpeg',
        0.75,
      );
    });

    return {
      previewUrl: URL.createObjectURL(previewBlob),
      metadata: { width, height },
    };
  } catch {
    return {
      previewUrl: URL.createObjectURL(input.blob),
    };
  }
}

function generateAudioPreview(input: PreviewInput): PreviewOutput {
  // Architecture: return blob URL; future waveform canvas can replace this.
  return {
    previewUrl: URL.createObjectURL(input.blob),
    metadata: { previewType: 'audio-blob' },
  };
}
