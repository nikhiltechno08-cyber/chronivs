import { SLUG_MAX_LENGTH, SLUG_MIN_LENGTH, SLUG_PATTERN } from '../constants';
import type { ExperienceSlug } from '../types';

export type GenerateSlugOptions = {
  /** Maximum slug length after normalization. Defaults to {@link SLUG_MAX_LENGTH}. */
  readonly maxLength?: number;
  /** Optional suffix appended after normalization (e.g. short id fragment). */
  readonly suffix?: string;
};

/**
 * Normalizes arbitrary text into a URL-safe slug.
 *
 * Rules:
 * - Lowercase
 * - Non-alphanumeric sequences become single hyphens
 * - Leading/trailing hyphens trimmed
 * - Truncated to maxLength
 *
 * @param input - Source text (title, recipient name, etc.)
 * @param options - Normalization options
 * @returns Branded {@link ExperienceSlug} or empty string if result is too short
 */
export function generateSlug(input: string, options: GenerateSlugOptions = {}): ExperienceSlug {
  const maxLength = options.maxLength ?? SLUG_MAX_LENGTH;
  const suffix = options.suffix ? `-${normalizeSegment(options.suffix)}` : '';

  const base = normalizeSegment(input);
  const combined = `${base}${suffix}`.replace(/^-+|-+$/g, '');
  const truncated = combined.slice(0, maxLength).replace(/-+$/g, '');

  if (truncated.length < SLUG_MIN_LENGTH) {
    return truncated as ExperienceSlug;
  }

  return truncated as ExperienceSlug;
}

/**
 * Generates a slug with a random suffix to reduce collision probability.
 *
 * @param input - Source text
 * @returns Slug with 4-character random hex suffix
 */
export function generateUniqueSlug(input: string): ExperienceSlug {
  const bytes = new Uint8Array(2);
  crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return generateSlug(input, { suffix });
}

/**
 * Type guard for valid slug format.
 */
export function isValidSlug(value: unknown): value is ExperienceSlug {
  return typeof value === 'string' && value.length >= SLUG_MIN_LENGTH && SLUG_PATTERN.test(value);
}

function normalizeSegment(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}
