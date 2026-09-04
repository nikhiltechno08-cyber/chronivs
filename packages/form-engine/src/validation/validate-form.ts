import type { FormDefinition, FormFieldError, FormValidationResult, FormValues } from '../types';

import { validateField } from './validate-field';

/**
 * Validates all fields in a form definition against provided values.
 *
 * @param form - Generated form definition
 * @param values - Current field values keyed by field id
 * @returns Aggregated validation result
 */
export function validateForm(form: FormDefinition, values: FormValues): FormValidationResult {
  const errors: FormFieldError[] = [];

  for (const field of form.fields) {
    if (field.hidden) continue;
    const value = values[field.id] ?? null;
    const result = validateField(field, value);
    if (!result.valid) {
      errors.push(...result.errors);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a subset of fields (e.g. a wizard step).
 */
export function validateFormFields(
  form: FormDefinition,
  values: FormValues,
  fieldIds: readonly string[],
): FormValidationResult {
  const errors: FormFieldError[] = [];
  const idSet = new Set(fieldIds);

  for (const field of form.fields) {
    if (!idSet.has(field.id)) continue;
    const value = values[field.id] ?? null;
    const result = validateField(field, value);
    if (!result.valid) errors.push(...result.errors);
  }

  return { valid: errors.length === 0, errors };
}

/** Returns true when all visible fields pass validation. */
export function isFormValid(form: FormDefinition, values: FormValues): boolean {
  return validateForm(form, values).valid;
}

/** Gets the first error message for a specific field, if any. */
export function getFieldError(
  form: FormDefinition,
  values: FormValues,
  fieldId: string,
): string | undefined {
  const field = form.fields.find((f) => f.id === fieldId);
  if (!field) return undefined;
  const result = validateField(field, values[fieldId] ?? null);
  return result.errors[0]?.message;
}
