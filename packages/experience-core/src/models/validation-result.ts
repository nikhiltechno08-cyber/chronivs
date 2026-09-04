/**
 * Severity of a validation finding.
 */
export type ValidationSeverity = 'error' | 'warning';

/**
 * A single validation issue with a stable machine-readable code.
 */
export interface ValidationIssue {
  /** Stable error code for i18n and logging (e.g. `MISSING_TEMPLATE_ID`). */
  readonly code: string;
  /** Human-readable description of the issue. */
  readonly message: string;
  /** JSON-pointer-style path to the offending field (e.g. `content.fields.receiver_name`). */
  readonly path?: string;
  /** Whether this issue blocks publish/save. */
  readonly severity: ValidationSeverity;
}

/**
 * Outcome of validating an experience against domain rules.
 * Does not perform template-specific validation — use adapter layers for that.
 */
export interface ValidationResult {
  /** True when no error-severity issues are present. */
  readonly valid: boolean;
  /** Blocking issues that must be resolved. */
  readonly errors: readonly ValidationIssue[];
  /** Non-blocking advisories. */
  readonly warnings: readonly ValidationIssue[];
}

/** Successful validation result singleton. */
export const VALIDATION_OK: ValidationResult = {
  valid: true,
  errors: [],
  warnings: [],
} as const;

/**
 * Creates a {@link ValidationResult} from separate error and warning lists.
 */
export function createValidationResult(
  errors: readonly ValidationIssue[],
  warnings: readonly ValidationIssue[] = [],
): ValidationResult {
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Creates a single {@link ValidationIssue}.
 */
export function createValidationIssue(
  code: string,
  message: string,
  options?: { path?: string; severity?: ValidationSeverity },
): ValidationIssue {
  return {
    code,
    message,
    path: options?.path,
    severity: options?.severity ?? 'error',
  };
}
