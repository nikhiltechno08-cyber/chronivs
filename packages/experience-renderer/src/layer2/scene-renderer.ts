import type { Experience } from '@chronivs/experience-core';
import type { Recipe, RecipeSceneMappings } from '@chronivs/recipe-engine';

import type {
  RenderContentData,
  RenderMediaData,
  RenderSceneResult,
  RenderSettingsData,
  SceneRenderMetadata,
} from '../types';

import { mapContent } from '../layer1/map-content';
import { mapMedia } from '../layer1/map-media';
import { mapSettings } from '../layer1/map-settings';
import { applyFallbacks, resolveSource } from '../layer1/resolve-source';

export interface GetSceneDataOptions {
  readonly usePlaceholders?: boolean;
}

export interface MappedExperienceContext {
  readonly content: RenderContentData;
  readonly media: RenderMediaData;
  readonly settings: RenderSettingsData;
}

/** Build Layer 1 mapped context for an experience. */
export function buildMappedContext(
  experience: Experience,
  recipe: Recipe,
): MappedExperienceContext {
  return {
    content: mapContent(experience, recipe),
    media: mapMedia(experience),
    settings: mapSettings(experience, recipe),
  };
}

/**
 * Layer 2 — resolve scoped scene props from recipe mappings.
 *
 * Never exposes the full Experience — only declared prop keys.
 */
export function getSceneData(
  experience: Experience,
  recipe: Recipe,
  sceneId: string,
  mappings: RecipeSceneMappings | undefined,
  context?: MappedExperienceContext,
  options: GetSceneDataOptions = {},
): RenderSceneResult {
  const ctx = context ?? buildMappedContext(experience, recipe);
  const sceneEntry = recipe.sceneSequence.find((s) => s.sceneId === sceneId);
  const mapping = mappings?.scenes[sceneId];
  const usePlaceholders = options.usePlaceholders !== false;

  const props: Record<string, unknown> = {};
  const usedPlaceholders: string[] = [];
  const missingRequired: string[] = [];

  if (mapping) {
    for (const rule of mapping.props) {
      const resolved = resolveSource(
        experience,
        ctx.content,
        ctx.media,
        ctx.settings,
        rule.source,
      );

      let finalValue = resolved.value;

      if (usePlaceholders && resolved.isEmpty) {
        const withFallback = applyFallbacks(
          resolved,
          rule.prop,
          rule.fallback,
          rule.placeholder,
          mappings.globalDefaults,
        );
        finalValue = withFallback.value;
        if (withFallback.usedFallback || withFallback.usedPlaceholder) {
          usedPlaceholders.push(rule.prop);
        }
      }

      if (rule.required && (finalValue === null || finalValue === undefined ||
          (typeof finalValue === 'string' && finalValue.trim() === ''))) {
        missingRequired.push(rule.prop);
      }

      props[rule.prop] = finalValue;
    }
  } else {
    inferSceneProps(experience, ctx, sceneId, props, usedPlaceholders);
  }

  const order = recipe.sceneSequence.findIndex((s) => s.sceneId === sceneId);

  const metadata: SceneRenderMetadata = {
    sceneId,
    label: mapping?.label ?? sceneEntry?.label,
    order: order >= 0 ? order : 0,
    optional: sceneEntry?.optional,
    enabled: experience.content.scenes[sceneId]?.enabled !== false,
    usedPlaceholders,
    missingRequired,
  };

  return { sceneId, props, metadata };
}

/** Infer minimal props from recipe field consumedByScenes when no mapping exists. */
function inferSceneProps(
  experience: Experience,
  ctx: MappedExperienceContext,
  sceneId: string,
  props: Record<string, unknown>,
  usedPlaceholders: string[],
): void {
  for (const [key, value] of Object.entries(ctx.content.fields)) {
    if (value !== null && value !== undefined) {
      const camelKey = snakeToCamel(key);
      props[camelKey] = value;
    }
  }

  if (sceneId.includes('photo') || sceneId.includes('memor') || sceneId.includes('album') || sceneId.includes('frame')) {
    props.photos = ctx.media.photos;
  }

  if (sceneId.includes('letter') || sceneId.includes('love')) {
    props.message = ctx.content.fields.custom_message ?? ctx.content.fields.letter ?? null;
    if (!props.message) usedPlaceholders.push('message');
  }

  if (sceneId.includes('proposal') || sceneId.includes('prop-proposal')) {
    props.senderName = ctx.content.fields.sender_name ?? experience.owner.displayName;
    props.receiverName = ctx.content.fields.receiver_name ?? experience.recipient.displayName;
  }

  props.theme = ctx.settings.theme;
  void experience;
}

function snakeToCamel(key: string): string {
  return key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

/** Layer 2 — render a single scene (data-only, no UI). */
export function renderScene(
  experience: Experience,
  recipe: Recipe,
  sceneId: string,
  mappings: RecipeSceneMappings | undefined,
  options?: GetSceneDataOptions,
): RenderSceneResult {
  return getSceneData(experience, recipe, sceneId, mappings, undefined, options);
}
