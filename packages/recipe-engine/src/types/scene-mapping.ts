/**
 * Declarative data source paths resolved by the Experience Renderer.
 *
 * Recipes define these paths — the renderer never hardcodes template logic.
 */
export type SceneDataSource =
  | `fields.${string}`
  | 'media.photos'
  | 'media.puzzleImage'
  | 'media.audio'
  | 'media.primaryAudio'
  | 'settings.theme'
  | 'settings.share'
  | 'recipient.displayName'
  | 'recipient.nickname'
  | 'owner.displayName'
  | 'occasion'
  | 'relationship'
  | 'templateId'
  | `scene.${string}.${string}`;

/**
 * Maps a single experience property to a scene prop name.
 */
export interface RecipeScenePropertyMapping {
  /** Output prop key passed to the scene adapter. */
  readonly prop: string;
  /** Declarative source path on the Experience aggregate. */
  readonly source: SceneDataSource;
  /** Static fallback when source resolves to null/undefined. */
  readonly fallback?: string;
  /** Placeholder hint used when value is empty (display-only default). */
  readonly placeholder?: string;
  /** When true, empty strings are replaced with fallback/placeholder. */
  readonly required?: boolean;
}

/**
 * Per-scene mapping — defines the minimal prop surface for one scene.
 */
export interface RecipeSceneMapping {
  readonly sceneId: string;
  readonly label?: string;
  readonly props: readonly RecipeScenePropertyMapping[];
}

/**
 * Complete scene mapping registry for a template recipe.
 */
export interface RecipeSceneMappings {
  readonly templateId: string;
  readonly scenes: Readonly<Record<string, RecipeSceneMapping>>;
  /** Global defaults applied before scene-level fallbacks. */
  readonly globalDefaults?: Readonly<Record<string, string>>;
}
