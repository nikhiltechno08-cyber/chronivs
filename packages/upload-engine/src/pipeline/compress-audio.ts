import { AssetKind } from '../enums/asset-kind';
import { AUDIO_COMPRESSION_DEFAULTS } from '../constants';
import type { CompressionInput, CompressionOutput } from '../types/upload';

export interface AudioCompressionOptions {
  readonly targetBitrateKbps?: number;
  readonly passThroughWhenUnsupported?: boolean;
}

/**
 * Audio compression stage of the upload pipeline.
 *
 * Architecture only: returns the original blob until a transcoder
 * (e.g. ffmpeg.wasm or Cloudinary eager transformation) is wired.
 */
export async function compressAudio(
  input: CompressionInput,
  options: AudioCompressionOptions = {},
): Promise<CompressionOutput> {
  const { file, mimeType } = input;
  const passThrough =
    options.passThroughWhenUnsupported ??
    AUDIO_COMPRESSION_DEFAULTS.passThroughWhenUnsupported;

  if (input.kind !== AssetKind.Audio) {
    return {
      blob: file,
      mimeType,
      metadata: { compressed: false, originalSize: file.size },
    };
  }

  const durationSeconds = await extractAudioDuration(file);

  if (passThrough) {
    return {
      blob: file,
      mimeType,
      metadata: {
        compressed: false,
        originalSize: file.size,
        durationSeconds,
        targetBitrateKbps:
          options.targetBitrateKbps ?? AUDIO_COMPRESSION_DEFAULTS.targetBitrateKbps,
      },
    };
  }

  // Future: wire ffmpeg.wasm or server-side transcoding here.
  return {
    blob: file,
    mimeType,
    metadata: {
      compressed: false,
      originalSize: file.size,
      durationSeconds,
    },
  };
}

/** Extract duration via HTMLAudioElement (browser). */
async function extractAudioDuration(file: File): Promise<number | undefined> {
  if (typeof Audio === 'undefined') return undefined;

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();

    const cleanup = () => {
      URL.revokeObjectURL(url);
      audio.removeAttribute('src');
      audio.load();
    };

    audio.addEventListener('loadedmetadata', () => {
      const duration = Number.isFinite(audio.duration) ? audio.duration : undefined;
      cleanup();
      resolve(duration);
    });

    audio.addEventListener('error', () => {
      cleanup();
      resolve(undefined);
    });

    audio.src = url;
  });
}
