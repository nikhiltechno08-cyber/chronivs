import type { TemplateId } from '@chronivs/experience-core';
import { getRecipeOrThrow, validateRecipe, type Recipe, type RecipeInput } from '@chronivs/recipe-engine';

import type { RecipePort } from '../../types/ports';

export class DefaultRecipeAdapter implements RecipePort {
  readonly name = 'recipe-engine';

  loadRecipe(templateId: TemplateId): Recipe {
    return getRecipeOrThrow(templateId);
  }

  validateRecipeInput(recipe: Recipe, input: unknown) {
    return validateRecipe(recipe.templateId, input as RecipeInput);
  }
}

export function createRecipePort(): RecipePort {
  return new DefaultRecipeAdapter();
}
