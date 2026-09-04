import type { Experience } from '@chronivs/experience-core';
import type { Recipe } from '@chronivs/recipe-engine';

import type { RenderSettingsData, RenderThemeData } from '../types';

/**
 * Layer 1 — map theme configuration to render-ready tokens.
 */
export function mapTheme(experience: Experience, recipe: Recipe): RenderThemeData {
  const userTheme = experience.settings.theme;

  return {
    presetId: recipe.theme.presetId,
    mode: userTheme.mode ?? recipe.theme.defaultMode ?? 'auto',
    accentColor: userTheme.accentColor,
    fontPreset: userTheme.fontPreset,
    customTokens: userTheme.customTokens,
  };
}

/**
 * Layer 1 — map experience settings (theme + share).
 */
export function mapSettings(experience: Experience, recipe: Recipe): RenderSettingsData {
  return {
    theme: mapTheme(experience, recipe),
    share: experience.settings.share,
  };
}

/** Alias for mapTheme — explicit audio/theme separation in API surface. */
export { mapTheme as mapThemeSettings };
