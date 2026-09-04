import type { OwnerId } from '../types';

/**
 * The creator or payer of an experience.
 */
export interface ExperienceOwner {
  /** Platform user or service account identifier. */
  readonly id: OwnerId;
  /** Display name shown in receipts and ownership UI. */
  readonly displayName?: string;
  /** Contact email for notifications (PII — handle per HIPAA/policy in storage). */
  readonly email?: string;
}

/**
 * The intended recipient of an experience.
 * Kept generic — no assumption about relationship to {@link ExperienceOwner}.
 */
export interface ExperienceRecipient {
  /** Display name used in cinematic copy ("For {name}"). */
  readonly displayName?: string;
  /** Optional nickname or pet name override for specific scenes. */
  readonly nickname?: string;
  /** Extension fields (e.g. pronouns, locale preference) without schema churn. */
  readonly extensions?: Readonly<Record<string, string | null>>;
}

/** Minimal owner placeholder for drafts before authentication. */
export const ANONYMOUS_OWNER: ExperienceOwner = {
  id: 'anonymous' as OwnerId,
} as const;

/** Empty recipient — populated during studio flow. */
export const EMPTY_RECIPIENT: ExperienceRecipient = {} as const;
