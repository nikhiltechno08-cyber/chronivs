/**
 * @chronivs/experience-renderer
 *
 * Recipe-driven Dynamic Experience Renderer.
 * Architecture phase — no UI, no template modifications, no API.
 */

export {
  ExperienceRenderer,
  createExperienceRenderer,
  renderExperience,
} from './engine';

export {
  applyFallbacks,
  buildMappedContext,
  getSceneData,
  mapAudio,
  mapContent,
  mapMedia,
  mapPhotos,
  mapPuzzleImage,
  mapSettings,
  mapTheme,
  mapThemeSettings,
  renderScene,
  resolveSource,
} from './engine/experience-renderer';

export {
  resolveContentField,
  resolveReceiverName,
  resolveSenderName,
} from './layer1/map-content';

export {
  DEFAULT_PLACEHOLDERS,
  EMPTY_AUDIO,
  EMPTY_PHOTOS,
  RENDERER_SCHEMA_VERSION,
} from './constants';

export type {
  ExperienceRendererOptions,
  RenderAudio,
  RenderContentData,
  RenderedExperience,
  RenderMediaData,
  RenderPhoto,
  RenderSceneResult,
  RenderSettingsData,
  RenderThemeData,
  ResolvedSourceValue,
  SceneRenderMetadata,
} from './types';

export type { GetSceneDataOptions, MappedExperienceContext } from './layer2';
