/**
 * Lifecycle status of an experience through creation, preview, payment, and publishing.
 */
export enum ExperienceStatus {
  /** Work-in-progress; not publicly accessible. */
  Draft = 'draft',
  /** Generated preview available to the owner; not yet paid or published. */
  Preview = 'preview',
  /** Awaiting successful payment before publish/unlock. */
  PendingPayment = 'pending_payment',
  /** Live and accessible via its public slug/URL. */
  Published = 'published',
  /** Soft-deleted or retired; retained for audit but not served. */
  Archived = 'archived',
}

/** All {@link ExperienceStatus} values as a readonly tuple for iteration and validation. */
export const EXPERIENCE_STATUS_VALUES = Object.values(ExperienceStatus) as readonly ExperienceStatus[];

/**
 * Type guard that narrows an unknown value to {@link ExperienceStatus}.
 */
export function isExperienceStatus(value: unknown): value is ExperienceStatus {
  return typeof value === 'string' && EXPERIENCE_STATUS_VALUES.includes(value as ExperienceStatus);
}

/** Statuses that allow public or semi-public access. */
export const PUBLICLY_ACCESSIBLE_STATUSES: readonly ExperienceStatus[] = [
  ExperienceStatus.Preview,
  ExperienceStatus.Published,
] as const;

/** Statuses that indicate the experience is still being edited. */
export const EDITABLE_STATUSES: readonly ExperienceStatus[] = [
  ExperienceStatus.Draft,
  ExperienceStatus.Preview,
  ExperienceStatus.PendingPayment,
] as const;
