import type { TemplateId } from '@chronivs/experience-core';

import { getRecipe } from './get-recipe';
import type { RecipeMediaLimits } from '../types';

/** Default limits applied when recipe is not found. */
const EMPTY_MEDIA_LIMITS: RecipeMediaLimits = {
  maxPhotos: 0,
  minPhotos: 0,
  maxAudioTracks: 0,
  minAudioTracks: 0,
  requiresPuzzleImage: false,
  acceptedImageMimeTypes: [],
  acceptedAudioMimeTypes: [],
};

/**
 * Returns media attachment limits for a recipe.
 *
 * @param templateId - Template identifier
 * @returns Media limits, or zeroed defaults when recipe not found
 */
export function getMediaLimits(templateId: TemplateId | string): RecipeMediaLimits {
  const recipe = getRecipe(templateId);
  return recipe?.mediaLimits ?? EMPTY_MEDIA_LIMITS;
}

/**
 * Returns true when the recipe supports photo uploads.
 */
export function supportsPhotos(templateId: TemplateId | string): boolean {
  return getMediaLimits(templateId).maxPhotos > 0;
}

/**
 * Returns true when the recipe supports audio uploads.
 */
export function supportsAudio(templateId: TemplateId | string): boolean {
  return getMediaLimits(templateId).maxAudioTracks > 0;
}

/**
 * Returns true when the recipe requires a dedicated puzzle/feature image.
 */
export function requiresPuzzleImage(templateId: TemplateId | string): boolean {
  return getMediaLimits(templateId).requiresPuzzleImage;
}
