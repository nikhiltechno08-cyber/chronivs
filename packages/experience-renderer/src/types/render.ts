import type { Experience } from '@chronivs/experience-core';

/** Render-ready photo reference. */
export interface RenderPhoto {
  readonly url: string;
  readonly alt?: string;
  readonly order: number;
  readonly id?: string;
}

/** Render-ready audio reference. */
export interface RenderAudio {
  readonly url: string;
  readonly durationSeconds?: number;
  readonly transcript?: string;
  readonly id?: string;
}

/** Layer 1 output — normalized media. */
export interface RenderMediaData {
  readonly photos: readonly RenderPhoto[];
  readonly puzzleImage: RenderPhoto | null;
  readonly audio: readonly RenderAudio[];
  readonly primaryAudio: RenderAudio | null;
}

/** Layer 1 output — normalized text content. */
export interface RenderContentData {
  readonly fields: Readonly<Record<string, string | null>>;
  readonly scenePayloads: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
}

/** Layer 1 output — theme tokens. */
export interface RenderThemeData {
  readonly presetId: string;
  readonly mode: 'light' | 'dark' | 'auto';
  readonly accentColor?: string;
  readonly fontPreset?: string;
  readonly customTokens?: Readonly<Record<string, string>>;
}

/** Layer 1 output — share and settings. */
export interface RenderSettingsData {
  readonly theme: RenderThemeData;
  readonly share: Experience['settings']['share'];
}

/** Metadata attached to each rendered scene. */
export interface SceneRenderMetadata {
  readonly sceneId: string;
  readonly label?: string;
  readonly order: number;
  readonly optional?: boolean;
  readonly enabled: boolean;
  readonly usedPlaceholders: readonly string[];
  readonly missingRequired: readonly string[];
}

/** Layer 2 output — scoped props for a single scene. */
export interface RenderSceneResult {
  readonly sceneId: string;
  readonly props: Readonly<Record<string, unknown>>;
  readonly metadata: SceneRenderMetadata;
}

/** Full experience render plan. */
export interface RenderedExperience {
  readonly templateId: string;
  readonly occasion: Experience['occasion'];
  readonly relationship: Experience['relationship'];
  readonly sceneOrder: readonly string[];
  readonly scenes: readonly RenderSceneResult[];
  readonly settings: RenderSettingsData;
  readonly content: RenderContentData;
  readonly media: RenderMediaData;
  readonly schemaVersion: number;
}

/** Options for the renderer. */
export interface ExperienceRendererOptions {
  readonly usePlaceholders?: boolean;
  readonly includeOptionalScenes?: boolean;
}

/** Source resolution result. */
export interface ResolvedSourceValue {
  readonly value: unknown;
  readonly usedFallback: boolean;
  readonly usedPlaceholder: boolean;
  readonly isEmpty: boolean;
}
