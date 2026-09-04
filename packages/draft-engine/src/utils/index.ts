import type { DraftId, ISOTimestamp } from '../types/branded';

/**
 * Generate a unique draft identifier.
 */
export function generateDraftId(): DraftId {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID() as DraftId;
  }

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `draft_${hex}` as DraftId;
}

/**
 * Current ISO-8601 timestamp.
 */
export function nowTimestamp(): ISOTimestamp {
  return new Date().toISOString() as ISOTimestamp;
}

/**
 * Detect offline mode when running in a browser.
 */
export function isOffline(): boolean {
  if (typeof navigator === 'undefined') return false;
  return !navigator.onLine;
}

/**
 * Simple deterministic checksum for payload integrity.
 */
export function computeChecksum(value: unknown): string {
  const str = typeof value === 'string' ? value : JSON.stringify(value);
  let hash = 5381;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/** Deep-merge plain objects (non-array). */
export function mergePayload<T extends Record<string, unknown>>(
  base: T,
  patch: Partial<T> | T,
): T {
  const result = { ...base };
  for (const key of Object.keys(patch) as (keyof T)[]) {
    const value = patch[key];
    if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      typeof result[key] === 'object' &&
      result[key] !== null &&
      !Array.isArray(result[key])
    ) {
      result[key] = mergePayload(
        result[key] as Record<string, unknown>,
        value as Record<string, unknown>,
      ) as T[keyof T];
    } else if (value !== undefined) {
      result[key] = value as T[keyof T];
    }
  }
  return result;
}
