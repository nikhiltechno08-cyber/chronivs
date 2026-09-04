import type { TemplateId } from '@chronivs/experience-core';
import { getRecipe, getSceneMappings } from '@chronivs/recipe-engine';

import { GLOBAL_SYNC_CHANNELS, PAYLOAD_FIELD_KEYS } from '../constants';
import type { PreviewDraftPayload } from '../types';

/** Static field → scene associations from recipe field metadata. */
const STATIC_FIELD_SCENE_MAP: Readonly<Record<string, readonly string[]>> = {
  senderName: ['love', 'forever', 'prop-letter', 'prop-proposal', 'heart'],
  receiverName: ['surprise', 'birthday', 'memories', 'love', 'celebration', 'prop-lantern', 'prop-proposal'],
  specialDate: ['birthday', 'celebration', 'prop-letter', 'prop-proposal'],
  customMessage: ['love', 'forever', 'heart'],
  letter: ['prop-letter', 'love'],
  photos: ['memories', 'celebration', 'prop-photo', 'prop-celebration'],
  audio: ['prop-celebration'],
  puzzleImage: ['prop-one-last-surprise', 'prop-photo'],
  theme: [GLOBAL_SYNC_CHANNELS.THEME],
  templateId: [GLOBAL_SYNC_CHANNELS.TEMPLATE],
};

/** Detect top-level payload keys that changed. */
export function detectChangedPayloadKeys(
  prev: PreviewDraftPayload,
  next: PreviewDraftPayload,
): string[] {
  const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
  const changed: string[] = [];

  for (const key of keys) {
    if (!shallowEqual(prev[key], next[key])) {
      changed.push(key);
    }
  }

  return changed;
}

/**
 * Resolve which scene ids are affected by changed payload keys.
 * Uses recipe scene mappings when available, static map as fallback.
 */
export function resolveAffectedScenes(
  templateId: TemplateId,
  changedKeys: readonly string[],
): string[] {
  const affected = new Set<string>();
  const mappings = getSceneMappings(templateId);
  const recipe = getRecipe(templateId);

  for (const key of changedKeys) {
    if (key === PAYLOAD_FIELD_KEYS.THEME) {
      addThemeScenes(affected, mappings, recipe?.sceneSequence.map((s) => s.sceneId) ?? []);
      continue;
    }

    if (key === PAYLOAD_FIELD_KEYS.TEMPLATE_ID) {
      affected.add(GLOBAL_SYNC_CHANNELS.TEMPLATE);
      continue;
    }

    const staticScenes = STATIC_FIELD_SCENE_MAP[key];
    if (staticScenes) {
      for (const sceneId of staticScenes) {
        if (sceneId.startsWith('__')) continue;
        affected.add(sceneId);
      }
    }

    if (mappings) {
      addScenesFromMappings(affected, mappings, key);
    }
  }

  if (recipe && affected.size === 0 && changedKeys.length > 0) {
    for (const entry of recipe.sceneSequence) {
      affected.add(entry.sceneId);
    }
  }

  return [...affected];
}

function addThemeScenes(
  affected: Set<string>,
  mappings: ReturnType<typeof getSceneMappings>,
  allSceneIds: readonly string[],
): void {
  if (mappings) {
    for (const [sceneId, mapping] of Object.entries(mappings.scenes)) {
      if (mapping.props.some((p) => p.prop === 'theme' || p.source === 'settings.theme')) {
        affected.add(sceneId);
      }
    }
  } else {
    for (const sceneId of allSceneIds) {
      affected.add(sceneId);
    }
  }
}

function addScenesFromMappings(
  affected: Set<string>,
  mappings: NonNullable<ReturnType<typeof getSceneMappings>>,
  payloadKey: string,
): void {
  const contentField = payloadKeyToContentField(payloadKey);

  for (const [sceneId, mapping] of Object.entries(mappings.scenes)) {
    for (const prop of mapping.props) {
      if (prop.source === `fields.${contentField}`) {
        affected.add(sceneId);
      }
      if (payloadKey === 'photos' && prop.source === 'media.photos') {
        affected.add(sceneId);
      }
      if (payloadKey === 'audio' && prop.source.startsWith('media.')) {
        affected.add(sceneId);
      }
      if (payloadKey === 'puzzleImage' && prop.source === 'media.puzzleImage') {
        affected.add(sceneId);
      }
    }
  }
}

function payloadKeyToContentField(key: string): string {
  const map: Record<string, string> = {
    senderName: 'sender_name',
    receiverName: 'receiver_name',
    specialDate: 'special_date',
    customMessage: 'custom_message',
    letter: 'letter',
    puzzleImage: 'puzzle_image',
  };
  return map[key] ?? key;
}

function shallowEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, i) => item === b[i]);
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  return false;
}

/** Whether a template change requires full preview reset. */
export function requiresFullReset(changedKeys: readonly string[]): boolean {
  return changedKeys.includes(PAYLOAD_FIELD_KEYS.TEMPLATE_ID);
}
