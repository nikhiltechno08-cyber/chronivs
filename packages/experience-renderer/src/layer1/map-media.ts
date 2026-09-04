import type { Experience, MediaAsset } from '@chronivs/experience-core';

import { EMPTY_AUDIO, EMPTY_PHOTOS } from '../constants';
import type { RenderAudio, RenderMediaData, RenderPhoto } from '../types';

function toRenderPhoto(asset: MediaAsset, index: number): RenderPhoto {
  return {
    url: asset.url,
    alt: asset.alt ?? asset.fileName,
    order: asset.order ?? index,
    id: asset.id,
  };
}

function toRenderAudio(asset: Experience['media']['audio'][number]): RenderAudio {
  return {
    url: asset.url,
    durationSeconds: asset.durationSeconds,
    transcript: asset.transcript,
    id: asset.id,
  };
}

/**
 * Layer 1 — map experience media to render-ready structures.
 */
export function mapMedia(experience: Experience): RenderMediaData {
  const sortedImages = [...experience.media.images].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  const photos = sortedImages.length > 0
    ? sortedImages.map(toRenderPhoto)
    : EMPTY_PHOTOS;

  const puzzleFieldUrl = experience.content.fields.puzzle_image;
  const puzzleAsset =
    sortedImages.find(
      (img) =>
        img.metadata?.role === 'puzzle' ||
        img.metadata?.slot === 'puzzle_image' ||
        img.sceneId === 'puzzle',
    ) ??
    (puzzleFieldUrl
      ? sortedImages.find((img) => img.url === puzzleFieldUrl)
      : undefined);

  const puzzleImage = puzzleAsset ? toRenderPhoto(puzzleAsset, 0) : null;

  const audioTracks = experience.media.audio.map(toRenderAudio);
  const primaryAudio = audioTracks[0] ?? EMPTY_AUDIO;

  return {
    photos,
    puzzleImage,
    audio: audioTracks,
    primaryAudio,
  };
}

/** Map photos only — convenience for gallery scenes. */
export function mapPhotos(experience: Experience): readonly RenderPhoto[] {
  return mapMedia(experience).photos;
}

/** Map primary audio — convenience for voice scenes. */
export function mapAudio(experience: Experience): RenderAudio | null {
  return mapMedia(experience).primaryAudio;
}

/** Map puzzle image — convenience for proposal puzzle scenes. */
export function mapPuzzleImage(experience: Experience): RenderPhoto | null {
  return mapMedia(experience).puzzleImage;
}
