import type { ISOTimestamp } from './branded';

/**
 * Version entry in draft history.
 */
export interface DraftVersion {
  /** Monotonic version number (1-based). */
  readonly version: number;
  /** When this version was created. */
  readonly createdAt: ISOTimestamp;
  /** Optional summary of what changed. */
  readonly changeSummary?: string;
  /** Payload checksum at this version. */
  readonly checksum?: string;
}
