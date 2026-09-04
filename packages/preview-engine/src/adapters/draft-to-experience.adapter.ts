import {
  EMPTY_EXPERIENCE_CONTENT,
  EMPTY_EXPERIENCE_MEDIA,
  EMPTY_RECIPIENT,
  ExperienceStatus,
  Relationship,
  type Experience,
  type ExperienceId,
  type ExperienceSlug,
  type ISOTimestamp,
  type MediaAsset,
  type MediaAssetId,
  type Occasion,
  type TemplateId,
} from '@chronivs/experience-core';
import { getRecipeOrThrow } from '@chronivs/recipe-engine';

import { DEFAULT_PHOTO_GRADIENTS } from '../constants';
import type { PreviewDraftPayload, PreviewPhotoRef } from '../types';

export interface DraftToExperienceOptions {
  readonly experienceId?: ExperienceId;
  readonly slug?: ExperienceSlug;
}

/**
 * Convert Draft Engine payload → Experience aggregate for the renderer.
 *
 * Adapter layer — Studio UI unchanged; composition root wires this later.
 */
export function draftPayloadToExperience(
  payload: PreviewDraftPayload,
  options: DraftToExperienceOptions = {},
): Experience {
  const templateId = (payload.templateId ?? 'birthday-girlfriend') as TemplateId;
  const recipe = getRecipeOrThrow(templateId);
  const now = new Date().toISOString() as ISOTimestamp;

  const fields: Record<string, string | null> = {
    sender_name: payload.senderName ?? null,
    receiver_name: payload.receiverName ?? null,
    special_date: payload.specialDate ?? null,
    custom_message: payload.customMessage ?? null,
    letter: payload.letter ?? null,
    puzzle_image: payload.puzzleImage ?? null,
  };

  const images = mapPhotosToMediaAssets(payload.photos ?? []);
  const audio = mapAudioToAssets(payload.audio);

  const occasion = (payload.occasion ?? recipe.occasion) as Occasion;
  const relationship = (payload.relationship ?? recipe.relationships[0] ?? Relationship.Girlfriend) as Relationship;

  return {
    id: (options.experienceId ?? `preview_${templateId}`) as ExperienceId,
    slug: (options.slug ?? `preview-${templateId}`) as ExperienceSlug,
    templateId,
    occasion,
    relationship,
    status: ExperienceStatus.Draft,
    createdAt: now,
    updatedAt: now,
    owner: {
      id: 'preview-owner' as Experience['owner']['id'],
      displayName: payload.senderName,
    },
    recipient: {
      ...EMPTY_RECIPIENT,
      displayName: payload.receiverName,
    },
    content: {
      ...EMPTY_EXPERIENCE_CONTENT,
      fields,
      scenes: {},
    },
    media: {
      images,
      audio,
    },
    settings: {
      theme: {
        mode: payload.theme?.mode ?? recipe.theme.defaultMode ?? 'auto',
        accentColor: payload.theme?.accentColor,
      },
      share: { isPublic: false, passwordProtected: false, allowDownload: false },
    },
    metadata: {},
    schemaVersion: 1,
  };
}

function mapPhotosToMediaAssets(photos: readonly PreviewPhotoRef[]): MediaAsset[] {
  const assets: MediaAsset[] = [];

  photos.forEach((photo, index) => {
    const url = photo.url ?? photo.dataUrl ?? photo.previewUrl ?? '';
    if (!url) return;

    assets.push({
      id: (photo.id ?? `photo_${index}`) as MediaAssetId,
      kind: 'image',
      url,
      order: photo.order ?? index,
      alt: `Photo ${index + 1}`,
    });
  });

  return assets;
}

function mapAudioToAssets(audio: PreviewDraftPayload['audio']): Experience['media']['audio'] {
  if (!audio) return EMPTY_EXPERIENCE_MEDIA.audio;

  const url = audio.url ?? audio.dataUrl;
  if (!url) return EMPTY_EXPERIENCE_MEDIA.audio;

  return [
    {
      id: 'preview_audio' as Experience['media']['audio'][number]['id'],
      url,
    },
  ];
}

/** Resolve photo URLs with gradient fallbacks for missing slots. */
export function resolvePreviewPhotos(
  photos: readonly PreviewPhotoRef[],
  slotCount = 5,
): readonly string[] {
  return Array.from({ length: slotCount }, (_, i) => {
    const photo = photos[i];
    const url = photo?.url ?? photo?.dataUrl ?? photo?.previewUrl;
    return url && url.length > 0
      ? url
      : DEFAULT_PHOTO_GRADIENTS[i % DEFAULT_PHOTO_GRADIENTS.length]!;
  });
}
