import {
  validatePublishReady,
  type PublishValidationIssue,
  type PublishValidationResult,
} from '@/services/publishValidator';
import type {
  ExperienceData,
  ExperienceValidationIssue,
  ExperienceValidationResult,
} from '@/types/experience';

/**
 * Reusable ExperienceData validator for checkout / publish gates.
 * Delegates to the centralized publishValidator service.
 */
export function validateExperienceData(data: ExperienceData): ExperienceValidationResult {
  const result: PublishValidationResult = validatePublishReady(data, {
    stage: 'pre_payment',
  });

  const errors: ExperienceValidationIssue[] = result.errors.map(
    (issue: PublishValidationIssue) => ({
      path: issue.field,
      code: issue.code ?? 'validation_error',
      message: issue.message,
    }),
  );

  return { valid: result.valid, errors };
}
