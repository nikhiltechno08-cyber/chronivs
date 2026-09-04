/**
 * @chronivs/recipe-engine
 *
 * Declarative Recipe Engine for Chronivs V2.
 *
 * Describes every experience template without hardcoded forms.
 * Pure TypeScript — no UI, no React, no backend coupling.
 *
 * @packageDocumentation
 */

// Engine API
export {
  getMediaLimits,
  getRecipe,
  getRecipeByOccasion,
  getRecipeFieldByKey,
  getRecipeFieldKeys,
  getRecipeFields,
  getRecipeOrThrow,
  getRequiredFieldKeys,
  hasRecipe,
  isValidRecipeInput,
  listOccasionsWithRecipes,
  listRecipes,
  listRelationshipsForOccasion,
  requiresPuzzleImage,
  resolveRecipe,
  supportsAudio,
  supportsPhotos,
  validateRecipe,
} from './engine';

export type { GetRecipeByOccasionOptions, GetRecipeFieldsOptions } from './engine';

// Types
export type {
  Recipe,
  RecipeDefaultValues,
  RecipeField,
  RecipeFieldType,
  RecipeInput,
  RecipeMediaLimits,
  RecipeMusic,
  RecipeSceneEntry,
  RecipeTheme,
  RecipeValidationIssue,
  RecipeValidationResult,
  RecipeValidationRule,
  RecipeValidationRuleType,
} from './types';

export type {
  RecipeSceneMapping,
  RecipeSceneMappings,
  RecipeScenePropertyMapping,
  SceneDataSource,
} from './types';

// Scene mappings (renderer data layer)
export {
  SCENE_MAPPING_REGISTRY,
  birthdayGirlfriendSceneMappings,
  getSceneMappings,
  hasSceneMappings,
  listMappedTemplateIds,
  proposalGirlfriendSceneMappings,
} from './mappings';

// Constants
export {
  DEFAULT_AUDIO_MIME_TYPES,
  DEFAULT_IMAGE_MIME_TYPES,
  RECIPE_FIELD_KEYS,
  RECIPE_MEDIA_KEYS,
  RECIPE_SCHEMA_VERSION,
  RECIPE_VALIDATION_CODES,
} from './constants';

export type { RecipeFieldKey, RecipeValidationCode } from './constants';

// Reusable field definitions
export {
  FIELD_ANNIVERSARY_DATE,
  FIELD_AUDIO,
  FIELD_BIRTHDAY_DATE,
  FIELD_CUSTOM_MESSAGE,
  FIELD_LETTER,
  FIELD_PHOTOS,
  FIELD_PROPOSAL_DATE,
  FIELD_PUZZLE_IMAGE,
  FIELD_RECEIVER_NAME,
  FIELD_RECEIVER_NAME_FATHER,
  FIELD_RECEIVER_NAME_GIRLFRIEND,
  FIELD_RECEIVER_NAME_MOTHER,
  FIELD_RECEIVER_NAME_PROPOSAL,
  FIELD_RECEIVER_NAME_WIFE,
  FIELD_SENDER_NAME,
  FIELD_SPECIAL_DATE,
} from './fields';

// Recipe registry + individual recipes
export {
  RECIPE_MAP,
  RECIPE_REGISTRY,
  RECIPE_TEMPLATE_IDS,
  anniversaryWifeRecipe,
  birthdayFatherRecipe,
  birthdayGirlfriendRecipe,
  birthdayMotherRecipe,
  proposalGirlfriendRecipe,
} from './recipes';
