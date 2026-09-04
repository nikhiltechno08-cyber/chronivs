import type { DraftSnapshot } from './snapshot';
import type { DraftVersion } from './version';

/**
 * Version history and recovery snapshots for a draft.
 */
export interface DraftHistory<TPayload = unknown> {
  /** Ordered version log (newest last). */
  readonly versions: readonly DraftVersion[];
  /** Recovery snapshots (subset of versions with full payload). */
  readonly snapshots: readonly DraftSnapshot<TPayload>[];
  /** Current active version number. */
  readonly currentVersion: number;
  /** Maximum versions / snapshots retained. */
  readonly maxVersions: number;
}
