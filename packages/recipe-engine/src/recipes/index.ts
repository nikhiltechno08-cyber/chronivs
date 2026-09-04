import type { TemplateId } from '@chronivs/experience-core';

import type { Recipe } from '../types';

import { anniversaryWifeRecipe } from './anniversary-wife.recipe';
import { birthdayFatherRecipe } from './birthday-father.recipe';
import { birthdayGirlfriendRecipe } from './birthday-girlfriend.recipe';
import { birthdayMotherRecipe } from './birthday-mother.recipe';
import { proposalGirlfriendRecipe } from './proposal-girlfriend.recipe';

/**
 * All registered recipes in display order.
 * Add new recipe files here after creation.
 */
export const RECIPE_REGISTRY: readonly Recipe[] = [
  birthdayGirlfriendRecipe,
  birthdayMotherRecipe,
  birthdayFatherRecipe,
  proposalGirlfriendRecipe,
  anniversaryWifeRecipe,
] as const;

const recipeMap = new Map<TemplateId, Recipe>(
  RECIPE_REGISTRY.map((recipe) => [recipe.templateId, recipe]),
);

/** Lookup map keyed by template id. */
export { recipeMap as RECIPE_MAP };

/** Template ids with registered recipes. */
export const RECIPE_TEMPLATE_IDS = RECIPE_REGISTRY.map((r) => r.templateId);

export { anniversaryWifeRecipe } from './anniversary-wife.recipe';
export { birthdayFatherRecipe } from './birthday-father.recipe';
export { birthdayGirlfriendRecipe } from './birthday-girlfriend.recipe';
export { birthdayMotherRecipe } from './birthday-mother.recipe';
export { proposalGirlfriendRecipe } from './proposal-girlfriend.recipe';
