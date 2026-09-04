import type { ISOTimestamp } from './branded';

/**
 * Point-in-time payload capture for recovery and versioning.
 */
export interface DraftSnapshot<TPayload = unknown> {
  /** Monotonic version number at capture time. */
  readonly version: number;
  /** When this snapshot was captured. */
  readonly capturedAt: ISOTimestamp;
  /** Serialized payload at this version. */
  readonly payload: TPayload;
  /** Content checksum for integrity verification. */
  readonly checksum?: string;
  /** Optional human-readable change label. */
  readonly label?: string;
}
