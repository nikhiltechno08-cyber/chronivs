import { createExperience, touchExperience } from '@/lib/createExperience';
import type { ExperienceData, ExperienceMediaAsset } from '@/types/experience';
import { useStudioStore } from '@/features/studio/store/studio-store';
import type { OccasionKey, RelationshipKey, StudioAudio, StudioPhoto } from '@/features/studio/types';

import type { ExperienceInputData, ExperienceTemplateId } from '../types';

export type StudioExperienceSnapshot = {
  experienceId?: string | null;
  occasion: OccasionKey | null;
  relationship: RelationshipKey | null;
  templateId?: string | null;
  senderName: string;
  receiverName: string;
  specialDate: string;
  customMessage: string;
  photos: StudioPhoto[];
  audio: StudioAudio | null;
};

/**
 * Build canonical ExperienceData from the studio draft.
 * This is the only bridge from studio fields → experience document.
 */
export function buildExperienceDataFromStudio(snapshot: StudioExperienceSnapshot): ExperienceData {
  const gallery: ExperienceMediaAsset[] = snapshot.photos
    .map((photo, index): ExperienceMediaAsset | null => {
      const url = photo.secureUrl || (photo.dataUrl?.startsWith('http') ? photo.dataUrl : '');
      if (!url) return null;
      return {
        id: photo.id,
        mediaId: photo.mediaId,
        publicId: photo.publicId,
        url,
        width: photo.width,
        height: photo.height,
        format: photo.format,
        bytes: photo.bytes,
        order: index,
      };
    })
    .filter((item): item is ExperienceMediaAsset => Boolean(item));

  const base = createExperience({
    experienceId: snapshot.experienceId ?? '',
    occasion: snapshot.occasion ?? '',
    relationship: snapshot.relationship ?? '',
    templateId: snapshot.templateId ?? '',
    recipientName: snapshot.receiverName,
    creatorName: snapshot.senderName,
    title: snapshot.customMessage ? 'A message for you' : '',
    letter: snapshot.customMessage,
    specialDate: snapshot.specialDate,
  });

  return touchExperience(base, {
    content: {
      ...base.content,
      letter: snapshot.customMessage,
      proposal: snapshot.customMessage,
      specialDate: snapshot.specialDate,
      title: base.content.title || (snapshot.receiverName ? `For ${snapshot.receiverName}` : ''),
      subtitle: snapshot.relationship || '',
    },
    media: {
      coverPhoto: gallery[0] ?? null,
      gallery,
      music: {
        enabled: Boolean(snapshot.audio?.url),
        url: snapshot.audio?.url,
        title: snapshot.audio ? 'Voice message' : undefined,
      },
    },
    settings: {
      ...base.settings,
      musicEnabled: Boolean(snapshot.audio?.url),
    },
  });
}

/**
 * Derive the flat template runtime view from ExperienceData ONLY.
 * Templates/scenes keep using ExperienceInputData without redesign.
 */
export function toExperienceInputData(experienceData: ExperienceData): ExperienceInputData {
  const photos = Array.from({ length: 5 }, (_, i) => experienceData.media.gallery[i]?.url ?? '');
  return {
    receiverName: experienceData.recipient.name || '',
    senderName: experienceData.creator.name || '',
    specialDate: experienceData.content.specialDate || undefined,
    customMessage: experienceData.content.letter || experienceData.content.proposal || '',
    photos,
    audioUrl: experienceData.media.music.url,
  };
}

/**
 * Map FE ExperienceData → backend sectioned ExperienceData (snake_case).
 * Stores the full FE document under metadata.notes.canonical for round-trip.
 */
export function toBackendExperienceData(experienceData: ExperienceData): Record<string, unknown> {
  const galleryItems = experienceData.media.gallery.map((item, order) => ({
    media_uuid: item.mediaId ?? null,
    caption: item.caption ?? null,
    order: item.order ?? order,
  }));

  return {
    general: {
      sender_name: experienceData.creator.name || null,
      receiver_name: experienceData.recipient.name || null,
      special_date: experienceData.content.specialDate || null,
      custom_message: experienceData.content.letter || null,
      experience_title: experienceData.content.title || null,
    },
    hero: {
      headline: experienceData.content.title || null,
      subheadline: experienceData.content.subtitle || null,
      cover_media_uuid: experienceData.media.coverPhoto?.mediaId ?? null,
    },
    timeline: {
      items: experienceData.content.timeline.map((item, order) => ({
        id: item.id,
        title: item.title,
        body: item.body,
        date_label: item.dateLabel ?? null,
        media_uuid: item.mediaId ?? null,
        order: item.order ?? order,
      })),
    },
    letter: {
      body: experienceData.content.letter || null,
      signature: experienceData.creator.name || null,
      opened: false,
    },
    gallery: {
      items: galleryItems,
    },
    music: {
      media_uuid: experienceData.media.music.mediaId ?? null,
      title: experienceData.media.music.title ?? null,
      autoplay: experienceData.settings.musicEnabled,
    },
    ending: {
      message: experienceData.content.subtitle || null,
      cta_label: null,
    },
    metadata: {
      locale: experienceData.settings.language || 'en',
      currency: 'INR',
      source: 'studio',
      notes: {
        // Fixed ExperienceData schema format version — not the autosave revision counter.
        schema_version: 1,
        canonical: experienceData,
        theme_id: experienceData.theme.id,
        proposal: experienceData.content.proposal,
        reasons: experienceData.content.reasons,
        gallery_urls: experienceData.media.gallery.map((g) => g.url),
        music_url: experienceData.media.music.url ?? null,
      },
    },
    theme: {
      accent: null,
      mood: experienceData.theme.id,
      palette: {},
    },
    animations: {
      reduced_motion: false,
      intensity: 'standard',
      flags: {
        show_confetti: experienceData.settings.showConfetti,
      },
    },
  };
}

export function resolveTemplateIdFromData(data: ExperienceData): ExperienceTemplateId | null {
  const id = data.templateId;
  const allowed: ExperienceTemplateId[] = [
    'birthday-girlfriend',
    'birthday-mother',
    'birthday-father',
    'anniversary-wife',
    'proposal-girlfriend',
  ];
  return allowed.includes(id as ExperienceTemplateId) ? (id as ExperienceTemplateId) : null;
}

/**
 * Restore FE ExperienceData from backend experience_data JSON.
 * Prefers metadata.notes.canonical; falls back to sectioned fields + gallery_urls.
 */
export function fromBackendExperienceData(
  backendData: Record<string, unknown> | null | undefined,
  meta: {
    id?: string;
    occasion?: string | null;
    relationship?: string | null;
    templateSlug?: string | null;
  } = {},
): ExperienceData {
  const notes =
    backendData &&
    typeof backendData === 'object' &&
    backendData.metadata &&
    typeof backendData.metadata === 'object'
      ? ((backendData.metadata as { notes?: Record<string, unknown> }).notes ?? {})
      : {};

  const canonical = notes.canonical;
  if (canonical && typeof canonical === 'object') {
    const doc = canonical as ExperienceData;
    return {
      ...createExperience(),
      ...doc,
      experienceId: meta.id || doc.experienceId || '',
      occasion: doc.occasion || meta.occasion || '',
      relationship: doc.relationship || meta.relationship || '',
      templateId: doc.templateId || meta.templateSlug || '',
      media: {
        coverPhoto: doc.media?.coverPhoto ?? null,
        gallery: Array.isArray(doc.media?.gallery) ? doc.media.gallery : [],
        music: {
          enabled: doc.media?.music?.enabled ?? true,
          url: doc.media?.music?.url,
          mediaId: doc.media?.music?.mediaId,
          title: doc.media?.music?.title,
        },
      },
    };
  }

  const general =
    backendData && typeof backendData.general === 'object'
      ? (backendData.general as Record<string, unknown>)
      : {};
  const letter =
    backendData && typeof backendData.letter === 'object'
      ? (backendData.letter as Record<string, unknown>)
      : {};
  const galleryUrls = Array.isArray(notes.gallery_urls)
    ? (notes.gallery_urls as string[]).filter((u) => typeof u === 'string' && u.startsWith('http'))
    : [];

  const gallery: ExperienceMediaAsset[] = galleryUrls.map((url, order) => ({
    id: `restored_${order}`,
    url,
    order,
  }));

  const base = createExperience({
    experienceId: meta.id || '',
    occasion: meta.occasion || '',
    relationship: meta.relationship || '',
    templateId: meta.templateSlug || '',
    recipientName: String(general.receiver_name || ''),
    creatorName: String(general.sender_name || ''),
    title: String(general.experience_title || ''),
    letter: String(letter.body || general.custom_message || ''),
    specialDate: String(general.special_date || ''),
  });

  return touchExperience(base, {
    media: {
      coverPhoto: gallery[0] ?? null,
      gallery,
      music: base.media.music,
    },
  });
}

/** Apply restored ExperienceData into the studio Zustand draft (editor recovery). */
export function applyExperienceDataToStudio(experienceData: ExperienceData): void {
  const store = useStudioStore.getState();

  const occasion = (experienceData.occasion || null) as OccasionKey | null;
  const relationship = (experienceData.relationship || null) as RelationshipKey | null;
  const templateId = resolveTemplateIdFromData(experienceData) ?? undefined;

  if (occasion) store.setOccasion(occasion);
  if (relationship) store.setRelationship(relationship);
  store.setSenderName(experienceData.creator.name || '');
  store.setReceiverName(experienceData.recipient.name || '');
  store.setSpecialDate(experienceData.content.specialDate || '');
  store.setCustomMessage(experienceData.content.letter || experienceData.content.proposal || '');
  store.setTemplateConfig({
    templateId,
    resolvedAt: experienceData.metadata.updatedAt || new Date().toISOString(),
  });
  store.setGeneratedExperience({
    id: experienceData.experienceId,
    status: 'ready',
    templateId,
    previewTitle: experienceData.content.title || undefined,
  });

  const photos: StudioPhoto[] = experienceData.media.gallery
    .filter((item) => item.url?.startsWith('http'))
    .map((item) => ({
      id: item.id || item.mediaId || `photo_${item.order}`,
      dataUrl: item.url,
      secureUrl: item.url,
      mediaId: item.mediaId,
      publicId: item.publicId,
      width: item.width,
      height: item.height,
      format: item.format,
      bytes: item.bytes,
      name: item.caption,
      uploadStatus: 'complete' as const,
      uploadProgress: 100,
    }));

  // Never wipe in-memory / session uploads with an empty remote gallery.
  if (photos.length > 0) {
    store.replacePhotos(photos);
  }

  if (experienceData.media.music.url) {
    store.setAudio({
      url: experienceData.media.music.url,
      source: 'uploaded',
      duration: 0,
    });
  }
}
