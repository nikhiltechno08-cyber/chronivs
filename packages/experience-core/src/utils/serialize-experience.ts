import {
  EXPERIENCE_SCHEMA_VERSION,
  SERIALIZATION_TYPE_EXPERIENCE,
  SERIALIZATION_TYPE_KEY,
  SERIALIZATION_VERSION_KEY,
} from '../constants';
import type { Experience } from '../models/experience';

/**
 * Wire format for a serialized experience document.
 * Includes type discriminator and schema version for safe deserialization.
 */
export type SerializedExperienceDocument = Experience & {
  readonly [SERIALIZATION_TYPE_KEY]: typeof SERIALIZATION_TYPE_EXPERIENCE;
  readonly [SERIALIZATION_VERSION_KEY]: number;
};

export type SerializeExperienceOptions = {
  /** When true (default), pretty-print JSON with 2-space indent. */
  readonly pretty?: boolean;
};

/**
 * Serializes an {@link Experience} to a JSON string with type metadata.
 *
 * @param experience - Domain aggregate to serialize
 * @param options - Formatting options
 * @returns JSON string suitable for storage or API transport
 */
export function serializeExperience(
  experience: Experience,
  options: SerializeExperienceOptions = {},
): string {
  const document: SerializedExperienceDocument = {
    ...experience,
    [SERIALIZATION_TYPE_KEY]: SERIALIZATION_TYPE_EXPERIENCE,
    [SERIALIZATION_VERSION_KEY]: experience.schemaVersion ?? EXPERIENCE_SCHEMA_VERSION,
  };

  return options.pretty ? JSON.stringify(document, null, 2) : JSON.stringify(document);
}

/**
 * Serializes an experience to a plain object (for databases that store JSONB).
 */
export function serializeExperienceToObject(experience: Experience): SerializedExperienceDocument {
  return {
    ...experience,
    [SERIALIZATION_TYPE_KEY]: SERIALIZATION_TYPE_EXPERIENCE,
    [SERIALIZATION_VERSION_KEY]: experience.schemaVersion ?? EXPERIENCE_SCHEMA_VERSION,
  };
}
