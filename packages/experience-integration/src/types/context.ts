import type { Experience, TemplateId } from '@chronivs/experience-core';
import type { Draft } from '@chronivs/draft-engine';
import type { FormDefinition, FormValidationResult, FormValues } from '@chronivs/form-engine';
import type { RenderedExperience } from '@chronivs/experience-renderer';
import type { PreviewState } from '@chronivs/preview-engine';
import type { Recipe } from '@chronivs/recipe-engine';
import type { UploadCollection } from '@chronivs/upload-engine';

import type { ExperienceLifecycle } from '../enums/experience-lifecycle';

/**
 * Immutable snapshot of the integrated experience session.
 * Studio reads this through the controller — never touches modules directly.
 */
export interface ExperienceContextSnapshot {
  /** Current lifecycle phase. */
  readonly lifecycle: ExperienceLifecycle;
  /** Selected template identifier. */
  readonly templateId: TemplateId | null;
  /** Loaded recipe definition. */
  readonly recipe: Recipe | null;
  /** Generated form from recipe. */
  readonly form: FormDefinition | null;
  /** Active draft record. */
  readonly draft: Draft | null;
  /** Upload engine asset collection. */
  readonly uploads: UploadCollection;
  /** Domain experience aggregate (derived from draft + uploads). */
  readonly experience: Experience | null;
  /** Renderer output plan. */
  readonly rendered: RenderedExperience | null;
  /** Live preview state. */
  readonly preview: PreviewState | null;
  /** Last validation outcome. */
  readonly validation: FormValidationResult | null;
  /** Current form field values mirror. */
  readonly formValues: FormValues;
  /** Recoverable error message. */
  readonly error: string | null;
  /** Monotonic session revision. */
  readonly revision: number;
  /** ISO timestamp of last mutation. */
  readonly updatedAt: string;
}

/** Listener for context mutations. */
export type ExperienceContextListener = (snapshot: ExperienceContextSnapshot) => void;

/** Options for creating a new experience session. */
export interface CreateExperienceOptions {
  readonly templateId: TemplateId;
  readonly initialValues?: FormValues;
  readonly metadata?: Draft['metadata'];
}

/** Content update payload. */
export interface UpdateContentInput {
  readonly values: Partial<FormValues>;
}

/** Media update payload. */
export interface UpdateMediaInput {
  readonly files?: readonly File[];
  readonly removeAssetIds?: readonly string[];
  readonly reorderFrom?: number;
  readonly reorderTo?: number;
}

/** Preview request options. */
export interface PreviewOptions {
  readonly force?: boolean;
  readonly viewport?: PreviewState['viewport'];
}

/** Validation options. */
export interface ValidateOptions {
  readonly strict?: boolean;
}

/** Controller configuration. */
export interface ExperienceControllerConfig {
  readonly autoSyncPreview?: boolean;
  readonly autoValidate?: boolean;
}

/** Future publish hook (Razorpay / backend) — architecture stub. */
export interface PublishPort {
  readonly name: string;
  publish(experience: Experience): Promise<{ readonly checkoutUrl?: string; readonly success: boolean }>;
}

/** Future auth hook — architecture stub. */
export interface AuthPort {
  readonly name: string;
  getUserId(): string | null;
  getAuthToken(): string | null;
}

/** Future API hook — architecture stub. */
export interface ExperienceApiPort {
  readonly name: string;
  saveExperience(experience: Experience): Promise<Experience>;
  loadExperience(id: Experience['id']): Promise<Experience | null>;
}
