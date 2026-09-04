import {
  EXPERIENCE_SCHEMA_VERSION,
  SERIALIZATION_TYPE_EXPERIENCE,
  SERIALIZATION_TYPE_KEY,
  SERIALIZATION_VERSION_KEY,
  VALIDATION_CODES,
} from '../constants';
import type { Experience } from '../models/experience';
import {
  createValidationIssue,
  createValidationResult,
  type ValidationResult,
} from '../models/validation-result';

import { validateExperience } from './validate-experience';

export type DeserializeExperienceResult =
  | { readonly success: true; readonly experience: Experience }
  | { readonly success: false; readonly validation: ValidationResult };

export type DeserializeExperienceOptions = {
  /** When true (default), run {@link validateExperience} after parsing. */
  readonly validate?: boolean;
};

/**
 * Deserializes a JSON string into an {@link Experience}.
 *
 * @param json - JSON string from storage or API
 * @param options - Deserialization options
 * @returns Success with experience or failure with validation errors
 */
export function deserializeExperience(
  json: string,
  options: DeserializeExperienceOptions = {},
): DeserializeExperienceResult {
  const shouldValidate = options.validate ?? true;

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return {
      success: false,
      validation: createValidationResult([
        createValidationIssue(
          VALIDATION_CODES.DESERIALIZE_INVALID_JSON,
          'Input is not valid JSON.',
        ),
      ]),
    };
  }

  return deserializeExperienceObject(parsed, { validate: shouldValidate });
}

/**
 * Deserializes a plain object into an {@link Experience}.
 * Strips serialization metadata keys before returning the domain entity.
 */
export function deserializeExperienceObject(
  value: unknown,
  options: DeserializeExperienceOptions = {},
): DeserializeExperienceResult {
  const shouldValidate = options.validate ?? true;

  if (!isRecord(value)) {
    return invalidShape('Root value must be an object.');
  }

  if (value[SERIALIZATION_TYPE_KEY] !== undefined && value[SERIALIZATION_TYPE_KEY] !== SERIALIZATION_TYPE_EXPERIENCE) {
    return invalidShape(`Unexpected document type: ${String(value[SERIALIZATION_TYPE_KEY])}`);
  }

  const { [SERIALIZATION_TYPE_KEY]: _type, [SERIALIZATION_VERSION_KEY]: _version, ...rest } = value;
  const experience = normalizeExperience(rest);

  if (shouldValidate) {
    const validation = validateExperience(experience);
    if (!validation.valid) {
      return { success: false, validation };
    }
    return { success: true, experience };
  }

  return { success: true, experience };
}

function normalizeExperience(raw: Record<string, unknown>): Experience {
  return {
    ...raw,
    schemaVersion:
      typeof raw.schemaVersion === 'number' ? raw.schemaVersion : EXPERIENCE_SCHEMA_VERSION,
  } as Experience;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function invalidShape(message: string): DeserializeExperienceResult {
  return {
    success: false,
    validation: createValidationResult([
      createValidationIssue(VALIDATION_CODES.DESERIALIZE_INVALID_SHAPE, message),
    ]),
  };
}
