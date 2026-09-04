/**
 * Supported dynamic form control types.
 * Maps to renderer adapters — not tied to any UI framework.
 */
export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'date'
  | 'image_upload'
  | 'audio_upload'
  | 'checkbox'
  | 'select'
  | 'radio'
  | 'hidden';

/**
 * Declarative validation rule attached to a generated form field.
 */
export type FormValidationRuleType =
  | 'required'
  | 'min_length'
  | 'max_length'
  | 'min_files'
  | 'max_files'
  | 'max_file_size'
  | 'allowed_types'
  | 'pattern';

/**
 * A single validation constraint on a form field.
 */
export interface FormValidationRule {
  /** Rule discriminator. */
  readonly type: FormValidationRuleType;
  /** Rule parameter (count, bytes, mime list, regex string, etc.). */
  readonly value?: number | string | readonly string[];
  /** Human-readable message when validation fails. */
  readonly message: string;
}

/**
 * Aggregated validation config for a field.
 */
export interface FormFieldValidation {
  readonly rules: readonly FormValidationRule[];
}

/**
 * A dynamically generated form field derived from a Recipe definition.
 */
export interface FormField {
  /** Stable field identifier — matches recipe content key. */
  readonly id: string;
  /** Control type for renderer adapters. */
  readonly type: FormFieldType;
  /** Display label. */
  readonly label: string;
  /** Input placeholder when applicable. */
  readonly placeholder?: string;
  /** Longer description shown as help context. */
  readonly description?: string;
  /** Whether the field must be filled before submit. */
  readonly required: boolean;
  /** Declarative validation rules. */
  readonly validation: FormFieldValidation;
  /** Default value seeded on form init. */
  readonly defaultValue?: string | boolean | readonly string[] | null;
  /** Accepted MIME types for file fields (comma-joinable for HTML accept). */
  readonly accept?: readonly string[];
  /** Maximum number of files for upload fields. */
  readonly maxFiles?: number;
  /** Maximum text length for text/textarea fields. */
  readonly maxLength?: number;
  /** Minimum text length for text/textarea fields. */
  readonly minLength?: number;
  /** Short help text for inline hints. */
  readonly helpText?: string;
  /** Maximum file size in bytes per file. */
  readonly maxFileSize?: number;
  /** Options for select/radio fields (future extensibility). */
  readonly options?: readonly FormFieldOption[];
  /** When true the field is not shown but included in submission. */
  readonly hidden?: boolean;
  /** Source recipe field type for adapter debugging. */
  readonly meta?: Readonly<Record<string, string>>;
}

/**
 * Option entry for select and radio controls.
 */
export interface FormFieldOption {
  readonly value: string;
  readonly label: string;
  readonly disabled?: boolean;
}

/**
 * Complete form definition generated from a Recipe.
 */
export interface FormDefinition {
  /** Template id this form was built from. */
  readonly templateId: string;
  /** Recipe display name. */
  readonly title: string;
  /** Recipe description used as form subtitle. */
  readonly description: string;
  /** Ordered list of generated fields. */
  readonly fields: readonly FormField[];
  /** Default values keyed by field id. */
  readonly defaultValues: Readonly<Record<string, FormFieldValue>>;
  /** Schema version for forward-compatible migrations. */
  readonly schemaVersion: number;
}

/**
 * Runtime value for a single form field.
 */
export type FormFieldValue =
  | string
  | boolean
  | readonly string[]
  | readonly FormFileMeta[]
  | null;

/**
 * File metadata used for client-side validation (no File API required server-side).
 */
export interface FormFileMeta {
  readonly name: string;
  readonly size: number;
  readonly mimeType: string;
  readonly url?: string;
}

/**
 * All form values keyed by field id.
 */
export type FormValues = Readonly<Record<string, FormFieldValue>>;

/**
 * Single field validation error.
 */
export interface FormFieldError {
  readonly fieldId: string;
  readonly message: string;
  readonly rule: FormValidationRuleType;
}

/**
 * Result of validating a form or single field.
 */
export interface FormValidationResult {
  readonly valid: boolean;
  readonly errors: readonly FormFieldError[];
}
