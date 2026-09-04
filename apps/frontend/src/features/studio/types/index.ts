/** Studio flow step identifiers */

export type StudioStep = 1 | 2 | 3 | 4 | 5 | 6;

/** Voice recording (step 5) is temporarily switched off; flip back to re-enable. */
export const VOICE_STEP_ENABLED = false;

/** Steps the user actually walks through, in order. */
export const STUDIO_STEP_SEQUENCE: readonly StudioStep[] = VOICE_STEP_ENABLED
  ? [1, 2, 3, 4, 5, 6]
  : [1, 2, 3, 4, 6];

export const TOTAL_STUDIO_STEPS = STUDIO_STEP_SEQUENCE.length;

/** Nearest active step, used when a disabled step is restored from storage. */
export function resolveStudioStep(step: StudioStep): StudioStep {
  if (STUDIO_STEP_SEQUENCE.includes(step)) return step;
  return STUDIO_STEP_SEQUENCE.find((candidate) => candidate > step) ?? STUDIO_STEP_SEQUENCE[0]!;
}

export function getNextStudioStep(step: StudioStep): StudioStep {
  const index = STUDIO_STEP_SEQUENCE.indexOf(resolveStudioStep(step));
  return STUDIO_STEP_SEQUENCE[Math.min(index + 1, STUDIO_STEP_SEQUENCE.length - 1)]!;
}

export function getPrevStudioStep(step: StudioStep): StudioStep {
  const index = STUDIO_STEP_SEQUENCE.indexOf(resolveStudioStep(step));
  return STUDIO_STEP_SEQUENCE[Math.max(index - 1, 0)]!;
}

/** 1-based position within the visible flow (for "Step X of Y"). */
export function getStudioStepPosition(step: StudioStep): number {
  return STUDIO_STEP_SEQUENCE.indexOf(resolveStudioStep(step)) + 1;
}

export type OccasionKey =
  | 'birthday'
  | 'proposal'
  | 'anniversary'
  | 'mothers'
  | 'fathers'
  | 'graduation'
  | 'christmas';

export type RelationshipKey =
  | 'girlfriend'
  | 'boyfriend'
  | 'mother'
  | 'father'
  | 'brother'
  | 'sister'
  | 'friend'
  | 'someone'
  | 'partner'
  | 'wife'
  | 'husband'
  | 'grandmother'
  | 'grandfather'
  | 'child'
  | 'family';

export type OccasionOption = {
  key: OccasionKey;
  emoji: string;
  label: string;
};

export type RelationshipOption = {
  key: RelationshipKey;
  label: string;
};

export type OccasionConfig = {
  relationships: RelationshipOption[];
  relHeadline: string;
  recipientLabel: string;
  dateLabel: string;
  messageLabel: string;
  emoji: string;
  summaryLabel: string;
};

export type PhotoUploadStatus = 'queued' | 'uploading' | 'complete' | 'error' | 'cancelled';

/**
 * Studio photo — Cloudinary-backed after upload.
 * `dataUrl` holds the display URL (secure Cloudinary URL once complete).
 * Do not keep File objects or base64 blobs for preview.
 */
export type StudioPhoto = {
  id: string;
  /** Display URL for tiles — set to Cloudinary secure_url when upload completes */
  dataUrl: string;
  name?: string;
  /** Backend media UUID for DELETE /media/{id} */
  mediaId?: string;
  publicId?: string;
  secureUrl?: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  uploadStatus?: PhotoUploadStatus;
  uploadProgress?: number;
  uploadError?: string | null;
  contentFingerprint?: string;
};

export type AudioSource = 'recorded' | 'uploaded';

export type StudioAudio = {
  url: string;
  source: AudioSource;
  duration: number;
};

/** Placeholder for future template engine integration */
export type TemplateConfig = {
  templateId?: string;
  resolvedAt?: string;
  [key: string]: unknown;
};

/** Placeholder for generated experience output */
export type GeneratedExperience = {
  id: string;
  status: 'pending' | 'generating' | 'ready';
  templateId?: string;
  previewTitle?: string;
  previewEmoji?: string;
  shareUrl?: string;
} | null;

export type StudioDraft = {
  step: StudioStep;
  occasion: OccasionKey | null;
  relationship: RelationshipKey | null;
  senderName: string;
  receiverName: string;
  specialDate: string;
  customMessage: string;
  /** 0-based preset index from template defaultMessages */
  selectedMessageIndex: number;
  photos: StudioPhoto[];
  audio: StudioAudio | null;
  templateConfig: TemplateConfig;
  generatedExperience: GeneratedExperience;
};

export type StudioPhase = 'flow' | 'loading' | 'complete';
