import { EXPERIENCE_ID_PATTERN, EXPERIENCE_ID_PREFIX } from '../constants';
import type { AudioAssetId, ExperienceId, MediaAssetId } from '../types';

/**
 * Generates a cryptographically random experience identifier.
 *
 * Format: `exp_{random}` — 16 hex chars from 8 random bytes.
 *
 * @returns A branded {@link ExperienceId}.
 */
export function generateExperienceId(): ExperienceId {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${EXPERIENCE_ID_PREFIX}_${hex}` as ExperienceId;
}

/**
 * Type guard for {@link ExperienceId} format.
 */
export function isExperienceId(value: unknown): value is ExperienceId {
  return typeof value === 'string' && EXPERIENCE_ID_PATTERN.test(value);
}

/**
 * Asserts that a string is a valid {@link ExperienceId}, returning it branded.
 *
 * @throws {Error} When the value does not match the expected format.
 */
export function assertExperienceId(value: string): ExperienceId {
  if (!isExperienceId(value)) {
    throw new Error(`Invalid ExperienceId format: "${value}"`);
  }
  return value;
}

/**
 * Generates a random media asset identifier.
 */
export function generateMediaAssetId(): MediaAssetId {
  return `med_${randomHex(6)}` as MediaAssetId;
}

/**
 * Generates a random audio asset identifier.
 */
export function generateAudioAssetId(): AudioAssetId {
  return `aud_${randomHex(6)}` as AudioAssetId;
}

function randomHex(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
