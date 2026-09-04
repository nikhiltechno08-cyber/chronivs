import type { ExperienceData } from '@/types/experience';

function isoNow(): string {
  return new Date().toISOString();
}

export type CreateExperienceDefaults = {
  experienceId?: string;
  occasion?: string;
  relationship?: string;
  templateId?: string;
  themeId?: string;
  recipientName?: string;
  creatorName?: string;
  title?: string;
  subtitle?: string;
  letter?: string;
  specialDate?: string;
  language?: string;
};

/**
 * Factory for a new canonical ExperienceData document.
 * Every new experience should start from this object.
 */
export function createExperience(defaults: CreateExperienceDefaults = {}): ExperienceData {
  const now = isoNow();
  return {
    experienceId: defaults.experienceId ?? '',
    occasion: defaults.occasion ?? '',
    relationship: defaults.relationship ?? '',
    templateId: defaults.templateId ?? '',
    theme: {
      id: defaults.themeId ?? 'golden-night',
    },
    recipient: {
      name: defaults.recipientName ?? '',
      nickname: '',
    },
    creator: {
      name: defaults.creatorName ?? '',
      email: '',
      phone: '',
    },
    content: {
      title: defaults.title ?? '',
      subtitle: defaults.subtitle ?? '',
      letter: defaults.letter ?? '',
      proposal: defaults.letter ?? '',
      timeline: [],
      reasons: [],
      specialDate: defaults.specialDate ?? '',
    },
    media: {
      coverPhoto: null,
      gallery: [],
      music: {
        enabled: true,
      },
    },
    settings: {
      language: defaults.language ?? 'en',
      musicEnabled: true,
      showConfetti: true,
    },
    metadata: {
      createdAt: now,
      updatedAt: now,
      version: 1,
    },
  };
}

/** Deep-merge helper that always bumps metadata.updatedAt. */
export function touchExperience(data: ExperienceData, patch: Partial<ExperienceData>): ExperienceData {
  return {
    ...data,
    ...patch,
    theme: patch.theme ? { ...data.theme, ...patch.theme } : data.theme,
    recipient: patch.recipient ? { ...data.recipient, ...patch.recipient } : data.recipient,
    creator: patch.creator ? { ...data.creator, ...patch.creator } : data.creator,
    content: patch.content ? { ...data.content, ...patch.content } : data.content,
    media: patch.media
      ? {
          ...data.media,
          ...patch.media,
          music: patch.media.music ? { ...data.media.music, ...patch.media.music } : data.media.music,
          gallery: patch.media.gallery ?? data.media.gallery,
          coverPhoto:
            patch.media.coverPhoto !== undefined ? patch.media.coverPhoto : data.media.coverPhoto,
        }
      : data.media,
    settings: patch.settings ? { ...data.settings, ...patch.settings } : data.settings,
    metadata: {
      ...data.metadata,
      ...(patch.metadata ?? {}),
      updatedAt: isoNow(),
      version: patch.metadata?.version ?? data.metadata.version,
    },
  };
}
