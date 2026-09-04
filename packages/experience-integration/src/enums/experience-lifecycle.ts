/**
 * Experience lifecycle phases managed by the Integration Layer.
 */
export enum ExperienceLifecycle {
  /** Controller constructed, not yet initialized. */
  Initialize = 'initialize',
  /** Recipe loaded for selected template. */
  LoadRecipe = 'load_recipe',
  /** Draft created or loaded. */
  CreateDraft = 'create_draft',
  /** Media assets attached or restored. */
  LoadAssets = 'load_assets',
  /** Live preview synchronized with draft. */
  SyncPreview = 'sync_preview',
  /** Validation pass completed. */
  Validate = 'validate',
  /** All systems ready for editing / preview. */
  Ready = 'ready',
  /** Recoverable error state. */
  Error = 'error',
  /** Reset to initial state. */
  Reset = 'reset',
}

export const EXPERIENCE_LIFECYCLE_VALUES = Object.values(
  ExperienceLifecycle,
) as readonly ExperienceLifecycle[];

/** Ordered happy-path progression. */
export const LIFECYCLE_PROGRESSION: readonly ExperienceLifecycle[] = [
  ExperienceLifecycle.Initialize,
  ExperienceLifecycle.LoadRecipe,
  ExperienceLifecycle.CreateDraft,
  ExperienceLifecycle.LoadAssets,
  ExperienceLifecycle.SyncPreview,
  ExperienceLifecycle.Validate,
  ExperienceLifecycle.Ready,
] as const;

export function isExperienceLifecycle(value: unknown): value is ExperienceLifecycle {
  return typeof value === 'string' && EXPERIENCE_LIFECYCLE_VALUES.includes(value as ExperienceLifecycle);
}
