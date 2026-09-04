import type { TemplateId } from '@chronivs/experience-core';

import { getRecipe } from './get-recipe';
import type { RecipeField } from '../types';

export type GetRecipeFieldsOptions = {
  /** When true, returns only required fields. */
  readonly requiredOnly?: boolean;
  /** When true, returns only optional fields. */
  readonly optionalOnly?: boolean;
};

/**
 * Returns the field definitions for a recipe.
 *
 * @param templateId - Template identifier
 * @param options - Filter options
 * @returns Field definitions, or empty array when recipe not found
 */
export function getRecipeFields(
  templateId: TemplateId | string,
  options: GetRecipeFieldsOptions = {},
): readonly RecipeField[] {
  const recipe = getRecipe(templateId);
  if (!recipe) return [];

  if (options.requiredOnly) return recipe.requiredFields;
  if (options.optionalOnly) return recipe.optionalFields;

  return [...recipe.requiredFields, ...recipe.optionalFields];
}

/**
 * Returns all field keys (required + optional) for a recipe.
 */
export function getRecipeFieldKeys(templateId: TemplateId | string): readonly string[] {
  return getRecipeFields(templateId).map((field) => field.key);
}

/**
 * Finds a single field definition by key on a recipe.
 */
export function getRecipeFieldByKey(
  templateId: TemplateId | string,
  fieldKey: string,
): RecipeField | undefined {
  return getRecipeFields(templateId).find((field) => field.key === fieldKey);
}

/**
 * Returns required field keys for a recipe.
 */
export function getRequiredFieldKeys(templateId: TemplateId | string): readonly string[] {
  return getRecipeFields(templateId, { requiredOnly: true }).map((f) => f.key);
}
