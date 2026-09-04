import type { Experience } from '@chronivs/experience-core';
import type { Recipe } from '@chronivs/recipe-engine';

import { DEFAULT_PLACEHOLDERS } from '../constants';
import type { RenderContentData } from '../types';

/**
 * Layer 1 — map experience text content to render-ready fields.
 */
export function mapContent(experience: Experience, recipe: Recipe): RenderContentData {
  const fields: Record<string, string | null> = { ...experience.content.fields };

  for (const [key, defaultValue] of Object.entries(recipe.defaultValues)) {
    if (typeof defaultValue === 'string' || defaultValue === null) {
      if (fields[key] === undefined) {
        fields[key] = defaultValue;
      }
    }
  }

  const scenePayloads: Record<string, Readonly<Record<string, unknown>>> = {};
  for (const [sceneId, sceneData] of Object.entries(experience.content.scenes)) {
    scenePayloads[sceneId] = sceneData.payload as Readonly<Record<string, unknown>>;
  }

  return { fields, scenePayloads };
}

/** Resolve a single content field with fallback chain. */
export function resolveContentField(
  content: RenderContentData,
  fieldKey: string,
  fallback?: string,
): string | null {
  const raw = content.fields[fieldKey];
  if (raw !== null && raw !== undefined && raw.trim() !== '') {
    return raw;
  }
  return fallback ?? null;
}

/** Resolve display name from content fields or participant. */
export function resolveReceiverName(
  experience: Experience,
  content: RenderContentData,
  fallback = DEFAULT_PLACEHOLDERS.receiverName,
): string {
  return (
    resolveContentField(content, 'receiver_name') ??
    experience.recipient.displayName ??
    experience.recipient.nickname ??
    fallback
  );
}

export function resolveSenderName(
  experience: Experience,
  content: RenderContentData,
  fallback = DEFAULT_PLACEHOLDERS.senderName,
): string {
  return (
    resolveContentField(content, 'sender_name') ??
    experience.owner.displayName ??
    fallback
  );
}
