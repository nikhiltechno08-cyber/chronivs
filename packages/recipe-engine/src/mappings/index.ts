import type { TemplateId } from '@chronivs/experience-core';

import type { RecipeSceneMappings } from '../types/scene-mapping';

import { birthdayGirlfriendSceneMappings } from './birthday-girlfriend.mapping';
import { proposalGirlfriendSceneMappings } from './proposal-girlfriend.mapping';

/**
 * Registry of scene mappings keyed by template id.
 * Add a new mapping file when introducing a template — renderer logic stays unchanged.
 */
export const SCENE_MAPPING_REGISTRY: readonly RecipeSceneMappings[] = [
  birthdayGirlfriendSceneMappings,
  proposalGirlfriendSceneMappings,
] as const;

const mappingMap = new Map<TemplateId, RecipeSceneMappings>(
  SCENE_MAPPING_REGISTRY.map((m) => [m.templateId as TemplateId, m]),
);

/** Retrieve scene mappings for a template, if registered. */
export function getSceneMappings(templateId: TemplateId): RecipeSceneMappings | undefined {
  return mappingMap.get(templateId);
}

/** Whether scene mappings exist for a template. */
export function hasSceneMappings(templateId: TemplateId): boolean {
  return mappingMap.has(templateId);
}

/** List template ids with registered scene mappings. */
export function listMappedTemplateIds(): TemplateId[] {
  return [...mappingMap.keys()];
}

export { birthdayGirlfriendSceneMappings } from './birthday-girlfriend.mapping';
export { proposalGirlfriendSceneMappings } from './proposal-girlfriend.mapping';
