import type { FormValues } from '@chronivs/form-engine';
import type { UploadCollection } from '@chronivs/upload-engine';
import { UploadStatus } from '@chronivs/upload-engine';
import { draftPayloadToExperience } from '@chronivs/preview-engine';
import type { PreviewDraftPayload } from '@chronivs/preview-engine';

import { ExperienceLifecycle } from '../enums/experience-lifecycle';
import type { ExperienceContextSnapshot } from '../types/context';

const EMPTY_VALUES: FormValues = {};

export function createEmptySnapshot(): ExperienceContextSnapshot {
  return {
    lifecycle: ExperienceLifecycle.Initialize,
    templateId: null,
    recipe: null,
    form: null,
    draft: null,
    uploads: [],
    experience: null,
    rendered: null,
    preview: null,
    validation: null,
    formValues: EMPTY_VALUES,
    error: null,
    revision: 0,
    updatedAt: new Date().toISOString(),
  };
}

export class ExperienceContext {
  private snapshot: ExperienceContextSnapshot = createEmptySnapshot();
  private readonly listeners = new Set<(s: ExperienceContextSnapshot) => void>();

  getSnapshot(): ExperienceContextSnapshot {
    return this.snapshot;
  }

  patch(partial: Partial<ExperienceContextSnapshot>): ExperienceContextSnapshot {
    this.snapshot = {
      ...this.snapshot,
      ...partial,
      revision: this.snapshot.revision + 1,
      updatedAt: new Date().toISOString(),
    };
    this.notify();
    return this.snapshot;
  }

  setLifecycle(lifecycle: ExperienceLifecycle): ExperienceContextSnapshot {
    return this.patch({ lifecycle, error: lifecycle === ExperienceLifecycle.Error ? this.snapshot.error : null });
  }

  subscribe(listener: (snapshot: ExperienceContextSnapshot) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  reset(): ExperienceContextSnapshot {
    this.snapshot = createEmptySnapshot();
    this.notify();
    return this.snapshot;
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.snapshot);
    }
  }
}

/** Map draft payload + uploads → preview/renderer payload. */
export function buildPreviewPayload(
  draftPayload: Record<string, unknown>,
  uploads: UploadCollection,
): PreviewDraftPayload {
  const photos = uploads
    .filter((a) => a.kind === 'image' && a.status !== UploadStatus.Removed)
    .sort((a, b) => a.order - b.order)
    .map((a) => ({
      id: a.id,
      url: a.originalUrl ?? a.previewUrl ?? undefined,
      previewUrl: a.previewUrl ?? undefined,
      order: a.order,
    }));

  const audioAsset = uploads.find((a) => a.kind === 'audio' && a.status === UploadStatus.Uploaded);

  return {
    ...draftPayload,
    photos,
    audio: audioAsset
      ? { url: audioAsset.originalUrl ?? audioAsset.previewUrl ?? undefined }
      : (draftPayload.audio as PreviewDraftPayload['audio']),
  } as PreviewDraftPayload;
}

/** Build Experience aggregate from draft + uploads. */
export function buildExperienceFromSession(
  draftPayload: Record<string, unknown>,
  uploads: UploadCollection,
) {
  return draftPayloadToExperience(buildPreviewPayload(draftPayload, uploads));
}

/** Merge form values into draft payload (snake_case content fields). */
export function formValuesToDraftPayload(
  base: Record<string, unknown>,
  values: FormValues,
): Record<string, unknown> {
  const payload = { ...base };

  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) continue;

    const camelKey = key.includes('_') ? snakeToCamel(key) : key;
    payload[camelKey] = value;
  }

  return payload;
}

function snakeToCamel(key: string): string {
  return key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}
