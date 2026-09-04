import type { TemplateId } from '@chronivs/experience-core';

import { RECIPE_MAP, RECIPE_REGISTRY } from '../recipes';
import type { Recipe } from '../types';

/**
 * Retrieves a recipe by template id.
 *
 * @param templateId - Template identifier (e.g. `birthday-girlfriend`)
 * @returns The recipe definition, or `undefined` if not registered
 */
export function getRecipe(templateId: TemplateId | string): Recipe | undefined {
  return RECIPE_MAP.get(templateId as TemplateId);
}

/**
 * Retrieves a recipe by template id, throwing when not found.
 *
 * @throws {Error} When no recipe exists for the given template id
 */
export function getRecipeOrThrow(templateId: TemplateId | string): Recipe {
  const recipe = getRecipe(templateId);
  if (!recipe) {
    throw new Error(`Recipe not found for templateId: ${templateId}`);
  }
  return recipe;
}

/**
 * Lists all registered recipes.
 */
export function listRecipes(): readonly Recipe[] {
  return RECIPE_REGISTRY;
}

/**
 * Returns true when a recipe exists for the template id.
 */
export function hasRecipe(templateId: string): templateId is TemplateId {
  return RECIPE_MAP.has(templateId as TemplateId);
}
