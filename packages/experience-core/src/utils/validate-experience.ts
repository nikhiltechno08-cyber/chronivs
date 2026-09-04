import { ExperienceStatus, isExperienceStatus } from '../enums/experience-status';
import { isOccasion } from '../enums/occasion';
import { isRelationship } from '../enums/relationship';
import { VALIDATION_CODES } from '../constants';
import type { Experience } from '../models/experience';
import {
  createValidationIssue,
  createValidationResult,
  type ValidationIssue,
  type ValidationResult,
} from '../models/validation-result';
import { isValidSlug } from './generate-slug';
import { isExperienceId } from './generate-id';

/**
 * Validates an {@link Experience} against domain-level structural rules.
 *
 * This function is template-agnostic. Template-specific rules belong in adapter
 * layers that extend the base validation result.
 *
 * @param experience - The experience aggregate to validate
 * @returns Structured validation outcome with errors and warnings
 */
export function validateExperience(experience: Experience): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  if (!experience.id || !isExperienceId(experience.id)) {
    errors.push(
      createValidationIssue(VALIDATION_CODES.MISSING_ID, 'Experience id is required and must be valid.', {
        path: 'id',
      }),
    );
  }

  if (!experience.slug) {
    errors.push(
      createValidationIssue(VALIDATION_CODES.MISSING_SLUG, 'Experience slug is required.', {
        path: 'slug',
      }),
    );
  } else if (!isValidSlug(experience.slug)) {
    errors.push(
      createValidationIssue(
        VALIDATION_CODES.INVALID_SLUG,
        'Experience slug must be lowercase alphanumeric with hyphens.',
        { path: 'slug' },
      ),
    );
  }

  if (!experience.templateId) {
    errors.push(
      createValidationIssue(VALIDATION_CODES.MISSING_TEMPLATE_ID, 'Template id is required.', {
        path: 'templateId',
      }),
    );
  }

  if (!experience.occasion) {
    errors.push(
      createValidationIssue(VALIDATION_CODES.MISSING_OCCASION, 'Occasion is required.', {
        path: 'occasion',
      }),
    );
  } else if (!isOccasion(experience.occasion)) {
    errors.push(
      createValidationIssue(VALIDATION_CODES.INVALID_OCCASION, 'Occasion value is not recognized.', {
        path: 'occasion',
      }),
    );
  }

  if (!experience.relationship) {
    errors.push(
      createValidationIssue(VALIDATION_CODES.MISSING_RELATIONSHIP, 'Relationship is required.', {
        path: 'relationship',
      }),
    );
  } else if (!isRelationship(experience.relationship)) {
    errors.push(
      createValidationIssue(
        VALIDATION_CODES.INVALID_RELATIONSHIP,
        'Relationship value is not recognized.',
        { path: 'relationship' },
      ),
    );
  }

  if (!experience.status) {
    errors.push(
      createValidationIssue(VALIDATION_CODES.MISSING_STATUS, 'Status is required.', {
        path: 'status',
      }),
    );
  } else if (!isExperienceStatus(experience.status)) {
    errors.push(
      createValidationIssue(VALIDATION_CODES.INVALID_STATUS, 'Status value is not recognized.', {
        path: 'status',
      }),
    );
  }

  if (!experience.createdAt) {
    errors.push(
      createValidationIssue(VALIDATION_CODES.MISSING_CREATED_AT, 'createdAt is required.', {
        path: 'createdAt',
      }),
    );
  }

  if (!experience.updatedAt) {
    errors.push(
      createValidationIssue(VALIDATION_CODES.MISSING_UPDATED_AT, 'updatedAt is required.', {
        path: 'updatedAt',
      }),
    );
  }

  if (!experience.owner?.id) {
    errors.push(
      createValidationIssue(VALIDATION_CODES.MISSING_OWNER, 'Owner id is required.', {
        path: 'owner.id',
      }),
    );
  }

  if (!experience.content) {
    errors.push(
      createValidationIssue(VALIDATION_CODES.MISSING_CONTENT, 'Content block is required.', {
        path: 'content',
      }),
    );
  }

  if (!experience.media) {
    errors.push(
      createValidationIssue(VALIDATION_CODES.MISSING_MEDIA, 'Media block is required.', {
        path: 'media',
      }),
    );
  }

  if (!experience.settings) {
    errors.push(
      createValidationIssue(VALIDATION_CODES.MISSING_SETTINGS, 'Settings block is required.', {
        path: 'settings',
      }),
    );
  }

  if (typeof experience.schemaVersion !== 'number' || experience.schemaVersion < 1) {
    errors.push(
      createValidationIssue(
        VALIDATION_CODES.INVALID_SCHEMA_VERSION,
        'schemaVersion must be a positive integer.',
        { path: 'schemaVersion' },
      ),
    );
  }

  if (experience.status === ExperienceStatus.Published) {
    if (!experience.settings.share.isPublic && !experience.settings.share.shareUrl) {
      warnings.push(
        createValidationIssue(
          VALIDATION_CODES.PUBLISHED_REQUIRES_PUBLIC_OR_URL,
          'Published experiences should be public or have a share URL configured.',
          { path: 'settings.share', severity: 'warning' },
        ),
      );
    }
  }

  if (!experience.recipient.displayName) {
    warnings.push(
      createValidationIssue(
        'MISSING_RECIPIENT_NAME',
        'Recipient display name is recommended for personalized copy.',
        { path: 'recipient.displayName', severity: 'warning' },
      ),
    );
  }

  return createValidationResult(errors, warnings);
}

/**
 * Returns true when the experience passes domain validation with no errors.
 */
export function isValidExperience(experience: Experience): boolean {
  return validateExperience(experience).valid;
}
