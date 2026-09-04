import type { Experience, TemplateId } from '@chronivs/experience-core';
import { getRecipeOrThrow, getSceneMappings } from '@chronivs/recipe-engine';
import type { Recipe } from '@chronivs/recipe-engine';

import { RENDERER_SCHEMA_VERSION } from '../constants';
import type { ExperienceRendererOptions, RenderedExperience } from '../types';

import { mapContent } from '../layer1/map-content';
import { mapMedia, mapAudio } from '../layer1/map-media';
import { mapSettings, mapTheme } from '../layer1/map-settings';
import {
  buildMappedContext,
  getSceneData as resolveSceneData,
  renderScene as resolveSceneRender,
} from '../layer2/scene-renderer';

/**
 * Dynamic Experience Renderer.
 *
 * Two-layer architecture:
 *   Layer 1 — Data Mapping (Experience → render-ready structures)
 *   Layer 2 — Scene Rendering (recipe mappings → scoped scene props)
 *
 * Template UI components consume {@link RenderSceneResult.props} via adapters.
 * The full Experience object is never passed to individual scenes.
 */
export class ExperienceRenderer {
  private readonly recipe: Recipe;
  private readonly options: ExperienceRendererOptions;

  constructor(recipe: Recipe, options: ExperienceRendererOptions = {}) {
    this.recipe = recipe;
    this.options = options;
  }

  /** Render the full experience as a scene plan. */
  renderExperience(experience: Experience): RenderedExperience {
    const mappings = getSceneMappings(experience.templateId);
    const context = buildMappedContext(experience, this.recipe);

    const sceneOrder = this.recipe.sceneSequence.map((s) => s.sceneId);
    const scenes = sceneOrder
      .filter((sceneId) => {
        const entry = this.recipe.sceneSequence.find((s) => s.sceneId === sceneId);
        if (this.options.includeOptionalScenes === false && entry?.optional) {
          return false;
        }
        return true;
      })
      .map((sceneId) =>
        resolveSceneData(experience, this.recipe, sceneId, mappings, context, {
          usePlaceholders: this.options.usePlaceholders,
        }),
      );

    return {
      templateId: experience.templateId,
      occasion: experience.occasion,
      relationship: experience.relationship,
      sceneOrder,
      scenes,
      settings: context.settings,
      content: context.content,
      media: context.media,
      schemaVersion: RENDERER_SCHEMA_VERSION,
    };
  }

  /** Render a single scene with scoped props. */
  renderScene(experience: Experience, sceneId: string) {
    const mappings = getSceneMappings(experience.templateId);
    return resolveSceneRender(experience, this.recipe, sceneId, mappings, {
      usePlaceholders: this.options.usePlaceholders,
    });
  }

  /** Get scoped data for one scene without full render pass. */
  getSceneData(experience: Experience, sceneId: string) {
    const mappings = getSceneMappings(experience.templateId);
    const context = buildMappedContext(experience, this.recipe);
    return resolveSceneData(experience, this.recipe, sceneId, mappings, context, {
      usePlaceholders: this.options.usePlaceholders,
    });
  }

  /** Layer 1 — map media. */
  mapMedia(experience: Experience) {
    return mapMedia(experience);
  }

  /** Layer 1 — map content fields. */
  mapContent(experience: Experience) {
    return mapContent(experience, this.recipe);
  }

  /** Layer 1 — map settings and theme. */
  mapSettings(experience: Experience) {
    return mapSettings(experience, this.recipe);
  }

  /** Layer 1 — map theme only. */
  mapTheme(experience: Experience) {
    return mapTheme(experience, this.recipe);
  }

  /** Layer 1 — map audio only. */
  mapAudio(experience: Experience) {
    return mapAudio(experience);
  }
}

/** Create a renderer from template id. */
export function createExperienceRenderer(
  templateId: TemplateId,
  options?: ExperienceRendererOptions,
): ExperienceRenderer {
  const recipe = getRecipeOrThrow(templateId);
  return new ExperienceRenderer(recipe, options);
}

/** Standalone render function. */
export function renderExperience(
  experience: Experience,
  options?: ExperienceRendererOptions,
): RenderedExperience {
  return createExperienceRenderer(experience.templateId, options).renderExperience(experience);
}

export {
  buildMappedContext,
  getSceneData,
  renderScene,
} from '../layer2/scene-renderer';
export { mapContent } from '../layer1/map-content';
export { mapMedia, mapAudio, mapPhotos, mapPuzzleImage } from '../layer1/map-media';
export { mapSettings, mapTheme, mapThemeSettings } from '../layer1/map-settings';
export { resolveSource, applyFallbacks } from '../layer1/resolve-source';
