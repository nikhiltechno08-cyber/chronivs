import type { ExperienceStatus } from '../enums/experience-status';
import type { ExperienceId } from '../types';

import type { Experience } from './experience';
import type { ValidationResult } from './validation-result';

/**
 * Studio-side draft persistence snapshot.
 * Tracks in-progress edits before an experience is finalized or published.
 */
export interface DraftState {
  /** Associated experience id once persisted; undefined for brand-new drafts. */
  readonly experienceId?: ExperienceId;
  /** Current wizard or editor step index (studio-specific interpretation). */
  readonly currentStep?: number;
  /** Whether unsaved changes exist since last persistence. */
  readonly isDirty: boolean;
  /** ISO-8601 timestamp of the last successful save. */
  readonly lastSavedAt?: string;
  /** Target status once the draft is submitted. */
  readonly targetStatus?: ExperienceStatus;
  /** Cached validation outcome from the most recent validate pass. */
  readonly validationSnapshot?: ValidationResult;
  /**
   * Partial experience payload representing the in-progress edit.
   * Merged onto a base experience during save/preview operations.
   */
  readonly draft: Partial<Experience>;
  /** Schema version for draft format migrations. */
  readonly schemaVersion?: number;
}

/** Initial empty draft state. */
export const EMPTY_DRAFT_STATE: DraftState = {
  isDirty: false,
  draft: {},
  schemaVersion: 1,
} as const;
