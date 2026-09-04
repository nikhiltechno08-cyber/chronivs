/**
 * Canonical relationship taxonomy between sender and recipient.
 * Independent of occasion — e.g. a Proposal may involve Girlfriend or Partner variants.
 */
export enum Relationship {
  Girlfriend = 'girlfriend',
  Boyfriend = 'boyfriend',
  Mother = 'mother',
  Father = 'father',
  Wife = 'wife',
  Husband = 'husband',
  BestFriend = 'best_friend',
  Brother = 'brother',
  Sister = 'sister',
  Custom = 'custom',
}

/** All {@link Relationship} values as a readonly tuple for iteration and validation. */
export const RELATIONSHIP_VALUES = Object.values(Relationship) as readonly Relationship[];

/**
 * Type guard that narrows an unknown value to {@link Relationship}.
 */
export function isRelationship(value: unknown): value is Relationship {
  return typeof value === 'string' && RELATIONSHIP_VALUES.includes(value as Relationship);
}
