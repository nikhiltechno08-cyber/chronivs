import type { OccasionKey, RelationshipKey } from '../types';

/**
 * Map studio occasion/relationship to Cloudinary folder segment.
 * Allowed backend folders: birthday, proposal, anniversary, father, mother, girlfriend, wife, general
 */
export function resolveStudioUploadFolder(
  occasion: OccasionKey | null,
  relationship: RelationshipKey | null,
): string {
  if (relationship === 'father') return 'father';
  if (relationship === 'mother') return 'mother';
  if (relationship === 'wife') return 'wife';
  if (relationship === 'girlfriend') return 'girlfriend';
  if (occasion === 'proposal') return 'proposal';
  if (occasion === 'anniversary') return 'anniversary';
  if (occasion === 'birthday' || occasion === 'fathers' || occasion === 'mothers') return 'birthday';
  return 'general';
}
