import type { PublishValidationIssue } from '@/services/publishValidator';

import type { ExperienceTemplateId } from '../../types';

export type ExperienceViewMode = 'preview' | 'published';

export type CinematicEndingProps = {
  visible: boolean;
  mode: ExperienceViewMode;
  templateId: ExperienceTemplateId;
  onRestart: () => void;
  onCreateExperience?: () => void | Promise<void>;
  onHome?: () => void;
  /** Pre-publish validation feedback (inline; no checkout redesign). */
  isValidating?: boolean;
  validationErrors?: PublishValidationIssue[];
  validationMessage?: string | null;
  /**
   * Public runtime only — optional “Create Your Own Experience” CTA.
   * Defaults to true for published mode; set false to hide.
   */
  showCreateOwnCta?: boolean;
  onCreateOwn?: () => void;
};
