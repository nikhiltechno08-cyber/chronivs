import { DRAFT_ENGINE_SCHEMA_VERSION, SERIALIZATION_TYPE_DRAFT } from '../constants';
import { DraftStatus } from '../enums/draft-status';
import { SyncStatus } from '../enums/sync-status';
import type { Draft } from '../types/draft';
import type { SerializedDraftDocument } from '../types/storage';

export class DraftDeserializationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DraftDeserializationError';
  }
}

/**
 * Deserialize a JSON string into a {@link Draft}.
 */
export function deserialize<TPayload = Record<string, unknown>>(
  json: string,
): Draft<TPayload> {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch {
    throw new DraftDeserializationError('Invalid JSON');
  }

  return deserializeObject<TPayload>(parsed);
}

/**
 * Deserialize a plain object into a {@link Draft}.
 */
export function deserializeObject<TPayload = Record<string, unknown>>(
  value: unknown,
): Draft<TPayload> {
  if (!value || typeof value !== 'object') {
    throw new DraftDeserializationError('Expected an object');
  }

  const doc = value as Partial<SerializedDraftDocument<TPayload>> & Partial<Draft<TPayload>>;

  if (doc.type === SERIALIZATION_TYPE_DRAFT && doc.draft) {
    return normalizeDraft(doc.draft);
  }

  if ('id' in doc && 'payload' in doc && 'metadata' in doc) {
    return normalizeDraft(doc as Draft<TPayload>);
  }

  throw new DraftDeserializationError('Unrecognized draft document format');
}

function normalizeDraft<TPayload>(draft: Draft<TPayload>): Draft<TPayload> {
  if (!draft.id || !draft.payload) {
    throw new DraftDeserializationError('Draft missing required fields');
  }

  return {
    ...draft,
    schemaVersion: draft.schemaVersion ?? DRAFT_ENGINE_SCHEMA_VERSION,
    status: draft.status ?? DraftStatus.Active,
    syncStatus: draft.syncStatus ?? SyncStatus.Local,
    isDirty: draft.isDirty ?? false,
    offline: draft.offline ?? false,
    version: draft.version ?? 1,
    createdAt: draft.createdAt,
    updatedAt: draft.updatedAt,
    history: draft.history ?? {
      versions: [],
      snapshots: [],
      currentVersion: draft.version ?? 1,
      maxVersions: 20,
    },
    snapshot: draft.snapshot ?? {
      version: draft.version ?? 1,
      capturedAt: draft.updatedAt ?? draft.createdAt,
      payload: draft.payload,
    },
  };
}
