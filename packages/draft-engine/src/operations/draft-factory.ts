import { DraftStatus } from '../enums/draft-status';
import { SyncStatus } from '../enums/sync-status';
import { DEFAULT_MAX_HISTORY_VERSIONS } from '../constants';
import type { Draft, DraftPatch } from '../types/draft';
import type { DraftSnapshot } from '../types/snapshot';
import type { DraftVersion } from '../types/version';
import { computeChecksum, generateDraftId, nowTimestamp } from '../utils';

export interface CreateDraftInput<TPayload> {
  readonly payload: TPayload;
  readonly metadata?: Draft['metadata'];
  readonly id?: Draft['id'];
}

/**
 * Create a new draft record with initial version history.
 */
export function createDraft<TPayload extends Record<string, unknown>>(
  input: CreateDraftInput<TPayload>,
  maxHistoryVersions = DEFAULT_MAX_HISTORY_VERSIONS,
): Draft<TPayload> {
  const id = input.id ?? generateDraftId();
  const createdAt = nowTimestamp();
  const checksum = computeChecksum(input.payload);
  const offline = typeof navigator !== 'undefined' ? !navigator.onLine : false;

  const version: DraftVersion = {
    version: 1,
    createdAt,
    changeSummary: 'Initial draft',
    checksum,
  };

  const snapshot: DraftSnapshot<TPayload> = {
    version: 1,
    capturedAt: createdAt,
    payload: input.payload,
    checksum,
    label: 'Initial',
  };

  return {
    id,
    metadata: input.metadata ?? {},
    payload: input.payload,
    snapshot,
    history: {
      versions: [version],
      snapshots: [snapshot],
      currentVersion: 1,
      maxVersions: maxHistoryVersions,
    },
    version: 1,
    status: DraftStatus.Active,
    createdAt,
    updatedAt: createdAt,
    isDirty: false,
    offline,
    syncStatus: SyncStatus.Local,
    schemaVersion: 1,
  };
}

/**
 * Clone an existing draft into a new record.
 */
export function clone<TPayload extends Record<string, unknown>>(
  source: Draft<TPayload>,
  overrides?: DraftPatch<TPayload>,
): Draft<TPayload> {
  const clonedPayload = structuredClone(source.payload);
  const cloned = createDraft<TPayload>({
    payload: overrides?.payload
      ? { ...clonedPayload, ...overrides.payload }
      : clonedPayload,
    metadata: {
      ...source.metadata,
      ...overrides?.metadata,
      clonedFrom: source.id,
      title: overrides?.metadata?.title ?? `${source.metadata.title ?? 'Draft'} (copy)`,
    },
  });

  return {
    ...cloned,
    status: overrides?.status ?? DraftStatus.Active,
    syncStatus: SyncStatus.Local,
  };
}

/**
 * Apply a patch and bump version history when payload changes.
 */
export function applyPatch<TPayload extends Record<string, unknown>>(
  draft: Draft<TPayload>,
  patch: DraftPatch<TPayload>,
  changeSummary = 'Updated',
): Draft<TPayload> {
  const updatedAt = nowTimestamp();
  const nextPayload = patch.payload
    ? ({ ...draft.payload, ...patch.payload } as TPayload)
    : draft.payload;

  const payloadChanged =
    patch.payload !== undefined &&
    computeChecksum(nextPayload) !== computeChecksum(draft.payload);

  let version = draft.version;
  let history = draft.history;
  let snapshot = draft.snapshot;

  if (payloadChanged) {
    version += 1;
    const checksum = computeChecksum(nextPayload);
    const versionEntry: DraftVersion = {
      version,
      createdAt: updatedAt,
      changeSummary,
      checksum,
    };
    const snapshotEntry: DraftSnapshot<TPayload> = {
      version,
      capturedAt: updatedAt,
      payload: nextPayload,
      checksum,
    };

    const versions = [...history.versions, versionEntry].slice(-history.maxVersions);
    const snapshots = [...history.snapshots, snapshotEntry].slice(-history.maxVersions);

    history = {
      ...history,
      versions,
      snapshots,
      currentVersion: version,
    };
    snapshot = snapshotEntry;
  }

  return {
    ...draft,
    metadata: patch.metadata ? { ...draft.metadata, ...patch.metadata } : draft.metadata,
    payload: nextPayload,
    snapshot,
    history,
    version,
    status: patch.status ?? draft.status,
    updatedAt,
    isDirty: patch.isDirty ?? payloadChanged,
    offline: patch.offline ?? draft.offline,
    syncStatus: patch.syncStatus ?? (payloadChanged ? SyncStatus.Pending : draft.syncStatus),
  };
}
