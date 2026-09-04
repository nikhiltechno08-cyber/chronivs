import type { Draft } from '../types/draft';
import type { RestoreOptions } from '../types/storage';
import { applyPatch } from './draft-factory';

/**
 * Restore a draft to a previous version from history snapshots.
 */
export function restore<TPayload extends Record<string, unknown>>(
  draft: Draft<TPayload>,
  options: RestoreOptions = {},
): Draft<TPayload> {
  const { version, snapshotIndex } = options;
  const snapshots = draft.history.snapshots;

  let target = snapshots[snapshots.length - 1];

  if (version !== undefined) {
    target = snapshots.find((s) => s.version === version) ?? target;
  } else if (snapshotIndex !== undefined) {
    target = snapshots[snapshotIndex] ?? target;
  }

  if (!target) {
    return draft;
  }

  return applyPatch(
    draft,
    {
      payload: target.payload as Partial<TPayload>,
      isDirty: true,
    },
    `Restored to version ${target.version}`,
  );
}
