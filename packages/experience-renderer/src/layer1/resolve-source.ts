import type { Experience } from '@chronivs/experience-core';
import type { SceneDataSource } from '@chronivs/recipe-engine';

import { DEFAULT_PLACEHOLDERS } from '../constants';
import type {
  RenderContentData,
  RenderMediaData,
  RenderSettingsData,
  ResolvedSourceValue,
} from '../types';

import { resolveReceiverName, resolveSenderName } from './map-content';

/**
 * Resolve a declarative {@link SceneDataSource} path against mapped experience data.
 */
export function resolveSource(
  experience: Experience,
  content: RenderContentData,
  media: RenderMediaData,
  settings: RenderSettingsData,
  source: SceneDataSource,
): ResolvedSourceValue {
  const empty = (value: unknown): boolean =>
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim() === '') ||
    (Array.isArray(value) && value.length === 0);

  let value: unknown;

  if (source.startsWith('fields.')) {
    const key = source.slice('fields.'.length);
    value = content.fields[key] ?? null;
  } else if (source === 'media.photos') {
    value = media.photos;
  } else if (source === 'media.puzzleImage') {
    value = media.puzzleImage;
  } else if (source === 'media.audio') {
    value = media.audio;
  } else if (source === 'media.primaryAudio') {
    value = media.primaryAudio;
  } else if (source === 'settings.theme') {
    value = settings.theme;
  } else if (source === 'settings.share') {
    value = settings.share;
  } else if (source === 'recipient.displayName') {
    value = resolveReceiverName(experience, content);
  } else if (source === 'recipient.nickname') {
    value = experience.recipient.nickname ?? null;
  } else if (source === 'owner.displayName') {
    value = resolveSenderName(experience, content);
  } else if (source === 'occasion') {
    value = experience.occasion;
  } else if (source === 'relationship') {
    value = experience.relationship;
  } else if (source === 'templateId') {
    value = experience.templateId;
  } else if (source.startsWith('scene.')) {
    const parts = source.slice('scene.'.length).split('.');
    const sceneId = parts[0];
    const payloadKey = parts[1];
    if (sceneId && payloadKey) {
      value = content.scenePayloads[sceneId]?.[payloadKey] ?? null;
    }
  }

  return {
    value,
    usedFallback: false,
    usedPlaceholder: false,
    isEmpty: empty(value),
  };
}

/** Apply fallback / placeholder chain to a resolved value. */
export function applyFallbacks(
  resolved: ResolvedSourceValue,
  prop: string,
  fallback?: string,
  placeholder?: string,
  globalDefaults?: Readonly<Record<string, string>>,
): ResolvedSourceValue {
  if (!resolved.isEmpty) {
    return resolved;
  }

  const globalDefault = globalDefaults?.[prop];
  const chain = [fallback, placeholder, globalDefault, DEFAULT_PLACEHOLDERS[prop as keyof typeof DEFAULT_PLACEHOLDERS]]
    .filter((v): v is string => typeof v === 'string' && v.length > 0);

  for (const candidate of chain) {
    if (candidate.trim() !== '') {
      return {
        value: candidate,
        usedFallback: candidate === fallback,
        usedPlaceholder: candidate === placeholder || candidate === globalDefault,
        isEmpty: false,
      };
    }
  }

  return resolved;
}
