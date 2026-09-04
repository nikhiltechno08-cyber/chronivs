/**
 * Pre-publish validation — reusable client-side gate before checkout.
 *
 * Templates can register extra rules via registerTemplatePublishRules
 * without changing the core validator.
 */

import { buildExperienceDataFromStudio } from '@/features/experience-engine/adapters/experience-data-adapter';
import { resolveTemplateId } from '@/features/experience-engine/core/template-registry';
import { useStudioStore } from '@/features/studio/store/studio-store';
import type { StudioPhoto } from '@/features/studio/types';
import { loadSessionMedia } from '@/features/studio/utils/session-media';
import type { ExperienceData } from '@/types/experience';

import { api } from './api-client';
import { createExperience, updateExperience } from './experience.service';

export type PublishValidationIssue = {
  field: string;
  message: string;
  code?: string;
};

export type PublishValidationSummary = {
  photos: number;
  template: string | null;
  readyForPublish: boolean;
};

export type PublishValidationResult = {
  valid: boolean;
  errors: PublishValidationIssue[];
  warnings: PublishValidationIssue[];
  summary: PublishValidationSummary;
};

export type PublishStage = 'pre_publish' | 'pre_payment';

export type PublishValidatorOptions = {
  stage?: PublishStage;
  /** Studio photo rows for pending/failed upload checks */
  photos?: StudioPhoto[];
  /** Optional gift message (checkout UI-only) for warnings */
  giftMessage?: string;
  /** Min uploaded photos (default 0 — photos are optional) */
  minPhotos?: number;
};

type TemplateRuleFn = (
  data: ExperienceData,
  options: PublishValidatorOptions,
) => { errors?: PublishValidationIssue[]; warnings?: PublishValidationIssue[] };

const MIN_PHOTOS_DEFAULT = 0;

const _templateRules = new Map<string, TemplateRuleFn[]>();

export function registerTemplatePublishRules(templateId: string, ...rules: TemplateRuleFn[]): void {
  const key = templateId.trim().toLowerCase();
  if (!key) return;
  const bucket = _templateRules.get(key) ?? [];
  for (const rule of rules) {
    if (!bucket.includes(rule)) bucket.push(rule);
  }
  _templateRules.set(key, bucket);
}

export function clearTemplatePublishRules(templateId?: string): void {
  if (!templateId) {
    _templateRules.clear();
    return;
  }
  _templateRules.delete(templateId.trim().toLowerCase());
}

function issue(field: string, message: string, code?: string): PublishValidationIssue {
  return { field, message, code };
}

function isDurableHttpsUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  const value = url.trim().toLowerCase();
  if (value.startsWith('blob:') || value.startsWith('data:')) return false;
  return value.startsWith('https://');
}

/**
 * Core client-side ExperienceData validation.
 * Does not hit the network — pair with validateExperienceOnServer for draft checks.
 */
export function validatePublishReady(
  data: ExperienceData,
  options: PublishValidatorOptions = {},
): PublishValidationResult {
  const stage: PublishStage = options.stage ?? 'pre_publish';
  const minPhotos = options.minPhotos ?? MIN_PHOTOS_DEFAULT;
  const errors: PublishValidationIssue[] = [];
  const warnings: PublishValidationIssue[] = [];

  if (!data.templateId?.trim()) {
    errors.push(issue('template', 'Template is required.', 'required_template'));
  }

  if (!data.occasion?.trim()) {
    errors.push(issue('occasion', 'Occasion is required.', 'required_occasion'));
  }

  if (!data.relationship?.trim()) {
    errors.push(issue('relationship', 'Relationship is required.', 'required_relationship'));
  }

  if (!data.recipient?.name?.trim()) {
    errors.push(issue('recipient.name', 'Recipient name is required.', 'required_recipient'));
  }

  const title = data.content?.title?.trim() || data.content?.letter?.trim();
  if (!title) {
    errors.push(issue('content.title', 'Experience title is required.', 'required_title'));
  }

  const email = data.creator?.email?.trim();
  const phone = data.creator?.phone?.trim();
  if (!email) {
    const emailIssue = issue('creator.email', 'Creator email is required.', 'required_creator_email');
    if (stage === 'pre_payment') errors.push(emailIssue);
    else warnings.push(emailIssue);
  }
  if (!phone) {
    const phoneIssue = issue('creator.phone', 'Creator phone is required.', 'required_creator_phone');
    if (stage === 'pre_payment') errors.push(phoneIssue);
    else warnings.push(phoneIssue);
  }

  // Structure / schema
  if (!data.recipient || typeof data.recipient !== 'object') {
    errors.push(issue('recipient', 'Recipient object is required.', 'missing_recipient'));
  }
  if (!data.creator || typeof data.creator !== 'object') {
    errors.push(issue('creator', 'Creator object is required.', 'missing_creator'));
  }
  if (!data.content || typeof data.content !== 'object') {
    errors.push(issue('content', 'Content object is required.', 'missing_content'));
  }
  if (!data.media || typeof data.media !== 'object') {
    errors.push(issue('media', 'Media object is required.', 'missing_media'));
  }
  if (!data.settings || typeof data.settings !== 'object') {
    errors.push(issue('settings', 'Settings object is required.', 'missing_settings'));
  }
  if (!data.metadata || typeof data.metadata !== 'object') {
    errors.push(issue('metadata', 'Metadata object is required.', 'missing_metadata'));
  } else {
    // metadata.version is a document revision (increments on autosave).
    // Schema format version is written separately as notes.schema_version (= 1).
    const revision = Number(data.metadata.version);
    if (!Number.isFinite(revision) || revision < 1) {
      errors.push(
        issue('metadata.version', 'Document version is invalid.', 'invalid_document_version'),
      );
    }
  }

  // Media
  const photos = options.photos;
  if (photos) {
    const pending = photos.some(
      (p) => p.uploadStatus === 'queued' || p.uploadStatus === 'uploading',
    );
    const failed = photos.some((p) => p.uploadStatus === 'error');
    if (pending) {
      errors.push(
        issue(
          'media.gallery',
          'Some photos are still uploading. Wait for uploads to finish.',
          'pending_uploads',
        ),
      );
    }
    if (failed) {
      errors.push(
        issue(
          'media.gallery',
          'Some photos failed to upload. Remove or re-upload them.',
          'failed_uploads',
        ),
      );
    }
  }

  const gallery = data.media?.gallery ?? [];
  const invalidLocal = gallery.some(
    (item) => item.url && (item.url.startsWith('blob:') || item.url.startsWith('data:')),
  );
  if (invalidLocal) {
    errors.push(
      issue(
        'media.gallery',
        'All photos must have valid Cloudinary URLs.',
        'invalid_cloudinary_url',
      ),
    );
  }

  const readyPhotos = gallery.filter((item) => isDurableHttpsUrl(item.url));
  if (readyPhotos.length < minPhotos) {
    errors.push(
      issue(
        'media.gallery',
        `Add at least ${minPhotos} uploaded photo before publishing.`,
        'required_photos',
      ),
    );
  }

  // Soft warnings
  if (!data.media?.music?.url && !data.settings?.musicEnabled) {
    warnings.push(issue('media.music', 'Background music not selected.', 'missing_music'));
  } else if (!data.media?.music?.url) {
    warnings.push(issue('media.music', 'Background music not selected.', 'missing_music'));
  }

  if (options.giftMessage !== undefined && !options.giftMessage.trim()) {
    warnings.push(issue('giftMessage', 'Gift message is empty.', 'empty_gift_message'));
  }

  if (!data.content?.letter?.trim() && !data.content?.proposal?.trim()) {
    warnings.push(issue('content.letter', 'Personal message is empty.', 'empty_message'));
  }

  const templateKey = (data.templateId || '').trim().toLowerCase();
  for (const rule of _templateRules.get(templateKey) ?? []) {
    try {
      const extra = rule(data, options);
      if (extra.errors?.length) errors.push(...extra.errors);
      if (extra.warnings?.length) warnings.push(...extra.warnings);
    } catch {
      // Ignore broken template rules — core validation must still run.
    }
  }

  const valid = errors.length === 0;
  return {
    valid,
    errors,
    warnings,
    summary: {
      photos: readyPhotos.length,
      template: data.templateId?.trim() || null,
      readyForPublish: valid,
    },
  };
}

type ServerValidateBody = {
  stage?: PublishStage;
  transition?: boolean;
  extras?: Record<string, unknown>;
};

/** Call POST /experiences/{id}/validate */
export async function validateExperienceOnServer(
  experienceId: string,
  body: ServerValidateBody = {},
): Promise<PublishValidationResult> {
  const response = await api.post<PublishValidationResult>(
    `/experiences/${encodeURIComponent(experienceId)}/validate`,
    {
      stage: body.stage ?? 'pre_publish',
      transition: body.transition ?? true,
      extras: body.extras ?? {},
    },
  );
  return {
    valid: Boolean(response.valid),
    errors: response.errors ?? [],
    warnings: response.warnings ?? [],
    summary: {
      photos: response.summary?.photos ?? 0,
      template: response.summary?.template ?? null,
      readyForPublish: Boolean(response.summary?.readyForPublish),
    },
  };
}

function resolveStudioPhotosAndAudio() {
  const studio = useStudioStore.getState();
  let photos = studio.photos;
  let audio = studio.audio;

  // Photos are intentionally not in zustand persist — fall back to session media
  // (same source preview uses) so Create This Experience sees uploaded Cloudinary URLs.
  if (!photos.length) {
    const session = loadSessionMedia();
    if (session?.photos?.length) {
      photos = session.photos;
      audio = audio ?? session.audio;
      useStudioStore.getState().replacePhotos(photos);
      if (!studio.audio && session.audio) {
        useStudioStore.getState().setAudio(session.audio);
      }
    }
  }

  return { photos, audio };
}

function buildStudioExperienceData(experienceId?: string | null): ExperienceData {
  const studio = useStudioStore.getState();
  const { photos, audio } = resolveStudioPhotosAndAudio();
  const templateId =
    studio.generatedExperience?.templateId ??
    studio.templateConfig.templateId ??
    resolveTemplateId(studio.occasion, studio.relationship) ??
    '';

  return buildExperienceDataFromStudio({
    experienceId: experienceId ?? studio.generatedExperience?.id ?? '',
    occasion: studio.occasion,
    relationship: studio.relationship,
    templateId,
    senderName: studio.senderName,
    receiverName: studio.receiverName,
    specialDate: studio.specialDate,
    customMessage: studio.customMessage,
    photos,
    audio,
  });
}

/**
 * Full publish pipeline for Preview → Publish:
 * 1) Client validation
 * 2) Ensure draft exists / is synced
 * 3) Server validation (+ DRAFT → READY_FOR_PAYMENT)
 */
export async function runPublishValidationPipeline(options: {
  stage?: PublishStage;
  giftMessage?: string;
  experienceId?: string | null;
  /** Merge creator contact before validation (checkout submit) */
  creator?: { name?: string; email?: string; phone?: string };
}): Promise<PublishValidationResult & { experienceId: string | null }> {
  const stage = options.stage ?? 'pre_publish';
  const studio = useStudioStore.getState();
  let experienceId =
    options.experienceId ?? studio.generatedExperience?.id ?? null;

  let data = buildStudioExperienceData(experienceId);
  if (options.creator) {
    data = {
      ...data,
      creator: {
        ...data.creator,
        name: options.creator.name?.trim() || data.creator.name,
        email: options.creator.email?.trim() || data.creator.email,
        phone: options.creator.phone?.trim() || data.creator.phone,
      },
    };
  }

  const { photos: resolvedPhotos } = resolveStudioPhotosAndAudio();
  const clientResult = validatePublishReady(data, {
    stage,
    photos: resolvedPhotos,
    giftMessage: options.giftMessage,
  });

  if (!clientResult.valid) {
    return { ...clientResult, experienceId };
  }

  // Ensure draft exists before server validation
  try {
    if (!experienceId) {
      const created = await createExperience(data);
      experienceId = created.id;
      data = { ...data, experienceId };
      const current = useStudioStore.getState().generatedExperience;
      useStudioStore.getState().setGeneratedExperience({
        id: experienceId,
        status: current?.status ?? 'ready',
        templateId: data.templateId || current?.templateId,
        previewTitle: current?.previewTitle,
      });
    } else {
      await updateExperience(experienceId, data);
    }
  } catch {
    return {
      valid: false,
      errors: [
        issue(
          'experience.uuid',
          'Could not save draft before validation. Check your connection and try again.',
          'draft_sync_failed',
        ),
      ],
      warnings: clientResult.warnings,
      summary: { ...clientResult.summary, readyForPublish: false },
      experienceId,
    };
  }

  try {
    const serverResult = await validateExperienceOnServer(experienceId, {
      stage,
      transition: true,
      extras: {
        gift_message: options.giftMessage,
      },
    });

    // Merge client warnings that server may not know about
    const warningKeys = new Set(serverResult.warnings.map((w) => `${w.field}:${w.message}`));
    const mergedWarnings = [
      ...serverResult.warnings,
      ...clientResult.warnings.filter((w) => !warningKeys.has(`${w.field}:${w.message}`)),
    ];

    return {
      ...serverResult,
      warnings: mergedWarnings,
      experienceId,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Validation request failed. Please try again.';
    return {
      valid: false,
      errors: [issue('validation', message, 'validation_request_failed')],
      warnings: clientResult.warnings,
      summary: { ...clientResult.summary, readyForPublish: false },
      experienceId,
    };
  }
}

/** Format errors for compact inline display (no UI redesign). */
export function formatPublishErrors(errors: PublishValidationIssue[]): string {
  if (!errors.length) return '';
  if (errors.length === 1) return errors[0]?.message ?? '';
  return errors.map((e) => e.message).join(' ');
}
