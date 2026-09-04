import type {
  FormField,
  FormFieldError,
  FormFieldValue,
  FormFileMeta,
  FormValidationResult,
  FormValidationRule,
} from '../types';

/**
 * Validates a single field value against its declarative rules.
 */
export function validateField(field: FormField, value: FormFieldValue): FormValidationResult {
  const errors: FormFieldError[] = [];

  for (const rule of field.validation.rules) {
    const error = evaluateRule(field, value, rule);
    if (error) errors.push(error);
  }

  return { valid: errors.length === 0, errors };
}

function evaluateRule(
  field: FormField,
  value: FormFieldValue,
  rule: FormValidationRule,
): FormFieldError | null {
  switch (rule.type) {
    case 'required':
      return validateRequired(field, value, rule) ? null : fieldError(field.id, rule);
    case 'min_length':
      return validateMinLength(value, rule) ? null : fieldError(field.id, rule);
    case 'max_length':
      return validateMaxLength(value, rule) ? null : fieldError(field.id, rule);
    case 'min_files':
      return validateMinFiles(value, rule) ? null : fieldError(field.id, rule);
    case 'max_files':
      return validateMaxFiles(value, rule) ? null : fieldError(field.id, rule);
    case 'max_file_size':
      return validateMaxFileSize(value, rule) ? null : fieldError(field.id, rule);
    case 'allowed_types':
      return validateAllowedTypes(value, rule) ? null : fieldError(field.id, rule);
    case 'pattern':
      return validatePattern(value, rule) ? null : fieldError(field.id, rule);
    default:
      return null;
  }
}

function validateRequired(field: FormField, value: FormFieldValue, _rule: FormValidationRule): boolean {
  if (field.type === 'checkbox') return typeof value === 'boolean';
  if (isFileField(field.type)) return getFileCount(value) > 0;
  if (typeof value === 'string') return value.trim().length > 0;
  return value != null;
}

function validateMinLength(value: FormFieldValue, rule: FormValidationRule): boolean {
  if (typeof value !== 'string') return true;
  const min = typeof rule.value === 'number' ? rule.value : 0;
  if (value.trim().length === 0) return true;
  return value.trim().length >= min;
}

function validateMaxLength(value: FormFieldValue, rule: FormValidationRule): boolean {
  if (typeof value !== 'string') return true;
  const max = typeof rule.value === 'number' ? rule.value : Infinity;
  return value.length <= max;
}

function validateMinFiles(value: FormFieldValue, rule: FormValidationRule): boolean {
  const min = typeof rule.value === 'number' ? rule.value : 0;
  if (min === 0) return true;
  return getFileCount(value) >= min;
}

function validateMaxFiles(value: FormFieldValue, rule: FormValidationRule): boolean {
  const max = typeof rule.value === 'number' ? rule.value : Infinity;
  return getFileCount(value) <= max;
}

function validateMaxFileSize(value: FormFieldValue, rule: FormValidationRule): boolean {
  const maxBytes = typeof rule.value === 'number' ? rule.value : Infinity;
  const files = extractFiles(value);
  if (files.length === 0) return true;
  return files.every((file) => file.size <= maxBytes);
}

function validateAllowedTypes(value: FormFieldValue, rule: FormValidationRule): boolean {
  const allowed = Array.isArray(rule.value) ? rule.value : [];
  if (allowed.length === 0) return true;
  const files = extractFiles(value);
  if (files.length === 0) return true;
  return files.every((file) => allowed.includes(file.mimeType));
}

function validatePattern(value: FormFieldValue, rule: FormValidationRule): boolean {
  if (typeof value !== 'string' || value.trim().length === 0) return true;
  const pattern = typeof rule.value === 'string' ? rule.value : '';
  if (!pattern) return true;
  return new RegExp(pattern).test(value);
}

function getFileCount(value: FormFieldValue): number {
  if (Array.isArray(value)) return value.length;
  if (typeof value === 'string' && value.trim().length > 0) return 1;
  return 0;
}

function extractFiles(value: FormFieldValue): readonly FormFileMeta[] {
  if (!Array.isArray(value)) {
    if (typeof value === 'string' && value.trim()) {
      return [{ name: 'file', size: 0, mimeType: 'application/octet-stream', url: value }];
    }
    return [];
  }

  return value.map((item) => {
    if (typeof item === 'string') {
      return { name: item, size: 0, mimeType: 'application/octet-stream', url: item };
    }
    return item as FormFileMeta;
  });
}

function isFileField(type: FormField['type']): boolean {
  return type === 'image_upload' || type === 'audio_upload';
}

function fieldError(fieldId: string, rule: FormValidationRule): FormFieldError {
  return {
    fieldId,
    message: rule.message,
    rule: rule.type,
  };
}

/** Convenience: returns true when a field passes all rules. */
export function isFieldValid(field: FormField, value: FormFieldValue): boolean {
  return validateField(field, value).valid;
}
