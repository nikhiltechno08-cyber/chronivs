/**
 * Canonical occasion taxonomy for Chronivs experiences.
 * Used to classify templates, routing metadata, and analytics — not UI copy.
 */
export enum Occasion {
  Birthday = 'birthday',
  Proposal = 'proposal',
  Anniversary = 'anniversary',
  Mother = 'mother',
  Father = 'father',
  Valentine = 'valentine',
  Friendship = 'friendship',
  Custom = 'custom',
}

/** All {@link Occasion} values as a readonly tuple for iteration and validation. */
export const OCCASION_VALUES = Object.values(Occasion) as readonly Occasion[];

/**
 * Type guard that narrows an unknown value to {@link Occasion}.
 */
export function isOccasion(value: unknown): value is Occasion {
  return typeof value === 'string' && OCCASION_VALUES.includes(value as Occasion);
}
