import type { Occasion } from '@chronivs/experience-core';
import type { Relationship } from '@chronivs/experience-core';

import { RECIPE_REGISTRY } from '../recipes';
import type { Recipe } from '../types';

export type GetRecipeByOccasionOptions = {
  /**
   * When provided, filters recipes that support this relationship.
   * When omitted, returns all recipes for the occasion.
   */
  readonly relationship?: Relationship;
  /** When true (default), excludes recipes with `isActive: false`. */
  readonly activeOnly?: boolean;
};

/**
 * Finds recipes matching an occasion and optional relationship.
 *
 * @param occasion - Occasion enum value
 * @param options - Filter options
 * @returns Matching recipes (may be empty)
 */
export function getRecipeByOccasion(
  occasion: Occasion,
  options: GetRecipeByOccasionOptions = {},
): readonly Recipe[] {
  const activeOnly = options.activeOnly ?? true;

  return RECIPE_REGISTRY.filter((recipe) => {
    if (recipe.occasion !== occasion) return false;
    if (activeOnly && !recipe.isActive) return false;
    if (options.relationship && !recipe.relationships.includes(options.relationship)) {
      return false;
    }
    return true;
  });
}

/**
 * Resolves the best-matching recipe for an occasion + relationship pair.
 * Returns the first active match, or `undefined` when none found.
 */
export function resolveRecipe(
  occasion: Occasion,
  relationship: Relationship,
): Recipe | undefined {
  const matches = getRecipeByOccasion(occasion, { relationship, activeOnly: true });
  return matches[0];
}

/**
 * Lists all occasions that have at least one registered recipe.
 */
export function listOccasionsWithRecipes(): readonly Occasion[] {
  const occasions = new Set<Occasion>();
  for (const recipe of RECIPE_REGISTRY) {
    if (recipe.isActive) occasions.add(recipe.occasion);
  }
  return [...occasions];
}

/**
 * Lists relationships supported by recipes for a given occasion.
 */
export function listRelationshipsForOccasion(occasion: Occasion): readonly Relationship[] {
  const relationships = new Set<Relationship>();
  for (const recipe of getRecipeByOccasion(occasion)) {
    for (const rel of recipe.relationships) {
      relationships.add(rel);
    }
  }
  return [...relationships];
}
