import type { Experience, TemplateId } from '@chronivs/experience-core';
import type { Draft, DraftPatch } from '@chronivs/draft-engine';
import type { FormDefinition, FormValidationResult, FormValues } from '@chronivs/form-engine';
import type { RenderedExperience } from '@chronivs/experience-renderer';
import type { PreviewDraftPayload, PreviewState, PreviewSyncResult } from '@chronivs/preview-engine';
import type { Recipe, RecipeValidationResult } from '@chronivs/recipe-engine';
import type {
  UploadCollection,
  UploadedAsset,
  UploadFileOptions,
  UploadResult,
} from '@chronivs/upload-engine';

// ─── Module Ports (replaceable interfaces) ───────────────────────────────────

/** @chronivs/recipe-engine */
export interface RecipePort {
  readonly name: string;
  loadRecipe(templateId: TemplateId): Recipe;
  validateRecipeInput(recipe: Recipe, input: unknown): RecipeValidationResult;
}

/** @chronivs/form-engine */
export interface FormPort {
  readonly name: string;
  buildForm(recipe: Recipe): FormDefinition;
  validateForm(form: FormDefinition, values: FormValues): FormValidationResult;
}

/** @chronivs/draft-engine */
export interface DraftPort {
  readonly name: string;
  createDraft(payload: Record<string, unknown>, metadata?: Draft['metadata']): Promise<Draft>;
  loadDraft(id: Draft['id']): Promise<Draft | null>;
  saveDraft(draft?: Draft): Promise<Draft>;
  updateDraft(patch: DraftPatch<Record<string, unknown>>): Promise<Draft>;
  getActiveDraft(): Draft | null;
  subscribe(listener: (draft: Draft | null) => void): () => void;
}

/** @chronivs/upload-engine */
export interface UploadPort {
  readonly name: string;
  getCollection(): UploadCollection;
  upload(file: File, options?: Omit<UploadFileOptions, 'file'>): Promise<UploadResult>;
  remove(assetId: string): UploadCollection;
  reorder(fromIndex: number, toIndex: number): UploadCollection;
  subscribe(listener: (collection: UploadCollection) => void): () => void;
}

/** @chronivs/experience-renderer */
export interface RendererPort {
  readonly name: string;
  render(experience: Experience): RenderedExperience;
}

/** @chronivs/preview-engine */
export interface PreviewPort {
  readonly name: string;
  bindDraft(manager: { subscribe: DraftPort['subscribe']; getActiveDraft: DraftPort['getActiveDraft'] }): () => void;
  sync(payload: PreviewDraftPayload): Promise<PreviewSyncResult>;
  scheduleUpdate(payload: PreviewDraftPayload): void;
  getState(): PreviewState;
  subscribe(listener: (state: PreviewState) => void): () => void;
}

/** @chronivs/experience-core + form-engine composite */
export interface ValidationPort {
  readonly name: string;
  validateExperience(experience: Experience): { readonly valid: boolean; readonly errors: readonly string[] };
  validateForm(form: FormDefinition, values: FormValues): FormValidationResult;
}

/** Aggregated module ports for dependency injection. */
export interface ExperienceModulePorts {
  readonly recipe: RecipePort;
  readonly form: FormPort;
  readonly draft: DraftPort;
  readonly upload: UploadPort;
  readonly renderer: RendererPort;
  readonly preview: PreviewPort;
  readonly validation: ValidationPort;
}

/** Upload port extended surface for asset access. */
export type { UploadedAsset, UploadResult };
