import {
  DRAFT_ENGINE_SCHEMA_VERSION,
  SERIALIZATION_TYPE_DRAFT,
} from '../constants';
import type { Draft } from '../types/draft';
import type { SerializedDraftDocument } from '../types/storage';

export interface SerializeOptions {
  readonly pretty?: boolean;
}

/**
 * Serialize a draft to a JSON string with type metadata.
 */
export function serialize<TPayload>(
  draft: Draft<TPayload>,
  options: SerializeOptions = {},
): string {
  const document: SerializedDraftDocument<TPayload> = {
    type: SERIALIZATION_TYPE_DRAFT,
    schemaVersion: draft.schemaVersion ?? DRAFT_ENGINE_SCHEMA_VERSION,
    draft,
  };

  return options.pretty ? JSON.stringify(document, null, 2) : JSON.stringify(document);
}

/**
 * Serialize to a plain object (JSONB-friendly).
 */
export function serializeToObject<TPayload>(
  draft: Draft<TPayload>,
): SerializedDraftDocument<TPayload> {
  return {
    type: SERIALIZATION_TYPE_DRAFT,
    schemaVersion: draft.schemaVersion ?? DRAFT_ENGINE_SCHEMA_VERSION,
    draft,
  };
}
