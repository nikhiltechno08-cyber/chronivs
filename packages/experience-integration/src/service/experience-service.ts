import type { TemplateId } from '@chronivs/experience-core';
import type { Draft } from '@chronivs/draft-engine';
import type { FormValues } from '@chronivs/form-engine';

import {
  buildExperienceFromSession,
  buildPreviewPayload,
  formValuesToDraftPayload,
} from '../context/experience-context';
import type { ExperienceContext } from '../context/experience-context';
import { ExperienceLifecycle } from '../enums/experience-lifecycle';
import type { DefaultDraftAdapter } from '../ports';
import type {
  CreateExperienceOptions,
  PreviewOptions,
  UpdateContentInput,
  UpdateMediaInput,
  ValidateOptions,
} from '../types/context';
import type { ExperienceModulePorts } from '../types/ports';
import type { PreviewState } from '@chronivs/preview-engine';
import type { UploadCollection } from '@chronivs/upload-engine';
/**
 * Experience Service — coordinates module ports without cross-module coupling.
 *
 * Each port is replaceable (local today, API / Cloudinary / Razorpay tomorrow).
 */
export class ExperienceService {
  private unbindPreview: (() => void) | null = null;
  private unbindUpload: (() => void) | null = null;

  constructor(
    private readonly ports: ExperienceModulePorts,
    private readonly context: ExperienceContext,
  ) {}

  async initialize(): Promise<void> {
    this.context.setLifecycle(ExperienceLifecycle.Initialize);
    await (this.ports.draft as DefaultDraftAdapter).initialize?.();
    this.wireSubscriptions();
  }

  loadRecipe(templateId: TemplateId) {
    const recipe = this.ports.recipe.loadRecipe(templateId);
    const form = this.ports.form.buildForm(recipe);

    this.context.patch({
      lifecycle: ExperienceLifecycle.LoadRecipe,
      templateId,
      recipe,
      form,
    });

    return { recipe, form };
  }

  async createDraft(payload: Record<string, unknown>, metadata?: Draft['metadata']) {
    const draft = await this.ports.draft.createDraft(payload, metadata);

    this.context.patch({
      lifecycle: ExperienceLifecycle.CreateDraft,
      draft,
      formValues: payload as FormValues,
    });

    return draft;
  }

  async loadDraft(id: Draft['id']) {
    const draft = await this.ports.draft.loadDraft(id);
    if (!draft) return null;

    const templateId = (draft.payload.templateId ?? draft.metadata.templateId) as TemplateId | undefined;
    if (templateId) {
      this.loadRecipe(templateId);
    }

    this.context.patch({
      lifecycle: ExperienceLifecycle.CreateDraft,
      draft,
      formValues: draft.payload as FormValues,
    });

    return draft;
  }

  async saveDraft() {
    const draft = await this.ports.draft.saveDraft();
    this.context.patch({ draft });
    return draft;
  }

  async updateContent(input: UpdateContentInput) {
    const current = this.context.getSnapshot();
    const mergedValues = { ...current.formValues, ...input.values } as FormValues;
    const payload = formValuesToDraftPayload(
      (current.draft?.payload as Record<string, unknown>) ?? {},
      mergedValues,
    );

    const draft = await this.ports.draft.updateDraft({ payload });

    this.context.patch({
      draft,
      formValues: mergedValues,
      lifecycle: ExperienceLifecycle.LoadAssets,
    });

    if (this.context.getSnapshot().lifecycle !== ExperienceLifecycle.Ready) {
      await this.syncPreview();
    } else {
      this.ports.preview.scheduleUpdate(buildPreviewPayload(payload, this.ports.upload.getCollection()));
    }

    return draft;
  }

  async updateMedia(input: UpdateMediaInput) {
    if (input.files) {
      for (const file of input.files) {
        await this.ports.upload.upload(file);
      }
    }

    if (input.removeAssetIds) {
      for (const id of input.removeAssetIds) {
        this.ports.upload.remove(id);
      }
    }

    if (input.reorderFrom !== undefined && input.reorderTo !== undefined) {
      this.ports.upload.reorder(input.reorderFrom, input.reorderTo);
    }

    const uploads = this.ports.upload.getCollection();

    this.context.patch({
      uploads,
      lifecycle: ExperienceLifecycle.LoadAssets,
    });

    const draft = this.ports.draft.getActiveDraft();
    if (draft) {
      const payload = buildPreviewPayload(draft.payload as Record<string, unknown>, uploads);
      await this.ports.draft.updateDraft({ payload });
      this.ports.preview.scheduleUpdate(payload);
    }

    return uploads;
  }

  async syncPreview(options: PreviewOptions = {}) {
    const snapshot = this.context.getSnapshot();
    const draft = snapshot.draft;
    if (!draft) return null;

    const payload = buildPreviewPayload(
      draft.payload as Record<string, unknown>,
      this.ports.upload.getCollection(),
    );

    const previewResult = options.force
      ? await this.ports.preview.sync(payload)
      : await this.ports.preview.sync(payload);

    const experience = buildExperienceFromSession(
      draft.payload as Record<string, unknown>,
      this.ports.upload.getCollection(),
    );
    const rendered = this.ports.renderer.render(experience);

    this.context.patch({
      lifecycle: ExperienceLifecycle.SyncPreview,
      experience,
      rendered,
      preview: previewResult.state,
    });

    return previewResult;
  }

  validate(options: ValidateOptions = {}) {
    const snapshot = this.context.getSnapshot();
    if (!snapshot.form) {
      throw new Error('Form not loaded — call loadRecipe first');
    }

    const formResult = this.ports.validation.validateForm(snapshot.form, snapshot.formValues);

    let experienceValid = true;
    let experienceErrors: string[] = [];

    if (options.strict && snapshot.experience) {
      const expResult = this.ports.validation.validateExperience(snapshot.experience);
      experienceValid = expResult.valid;
      experienceErrors = [...expResult.errors];
    }

    const validation = {
      ...formResult,
      valid: formResult.valid && experienceValid,
      errors: [
        ...formResult.errors,
        ...experienceErrors.map((message) => ({
          fieldId: '_experience',
          message,
          rule: 'required' as const,
        })),
      ],
    };

    this.context.patch({
      lifecycle: validation.valid ? ExperienceLifecycle.Ready : ExperienceLifecycle.Validate,
      validation,
    });

    return validation;
  }

  async bootstrapSession(options: CreateExperienceOptions) {
    this.loadRecipe(options.templateId);

    const recipe = this.context.getSnapshot().recipe!;
    const initialPayload: Record<string, unknown> = {
      templateId: options.templateId,
      occasion: recipe.occasion,
      relationship: recipe.relationships[0],
      ...options.initialValues,
    };

    await this.createDraft(initialPayload, {
      ...options.metadata,
      templateId: options.templateId,
    });

    await this.syncPreview({ force: true });
    return this.validate();
  }

  dispose(): void {
    this.unbindPreview?.();
    this.unbindUpload?.();
  }

  private wireSubscriptions(): void {
    this.unbindPreview?.();
    this.unbindUpload?.();

    this.unbindPreview = this.ports.preview.bindDraft({
      subscribe: this.ports.draft.subscribe.bind(this.ports.draft),
      getActiveDraft: this.ports.draft.getActiveDraft.bind(this.ports.draft),
    });

    this.unbindUpload = this.ports.upload.subscribe((uploads: UploadCollection) => {
      this.context.patch({ uploads });
    });

    this.ports.preview.subscribe((preview: PreviewState) => {
      this.context.patch({ preview });
    });
  }
}
