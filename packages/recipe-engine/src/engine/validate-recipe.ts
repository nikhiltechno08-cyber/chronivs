import { RECIPE_FIELD_KEYS, RECIPE_VALIDATION_CODES } from '../constants';
import { getRecipe } from './get-recipe';
import type {
  Recipe,
  RecipeInput,
  RecipeValidationIssue,
  RecipeValidationResult,
  RecipeValidationRule,
} from '../types';

/**
 * Validates user input against a recipe's declarative rules and field requirements.
 *
 * @param templateId - Template identifier
 * @param input - Generic field + media payload
 * @returns Structured validation result
 */
export function validateRecipe(
  templateId: string,
  input: RecipeInput,
): RecipeValidationResult {
  const recipe = getRecipe(templateId);

  if (!recipe) {
    return {
      valid: false,
      errors: [
        {
          code: RECIPE_VALIDATION_CODES.RECIPE_NOT_FOUND,
          message: `No recipe registered for template: ${templateId}`,
          severity: 'error',
        },
      ],
      warnings: [],
    };
  }

  const errors: RecipeValidationIssue[] = [];
  const warnings: RecipeValidationIssue[] = [];

  for (const rule of recipe.validationRules) {
    const issue = evaluateRule(rule, input, recipe);
    if (!issue) continue;
    if (issue.severity === 'error') errors.push(issue);
    else warnings.push(issue);
  }

  for (const field of recipe.requiredFields) {
    if (field.type === 'photo_collection') {
      const count = input.photos?.filter(Boolean).length ?? 0;
      if (count === 0) {
        warnings.push({
          code: RECIPE_VALIDATION_CODES.PHOTOS_BELOW_MIN,
          message: `${field.label} is recommended for this experience.`,
          target: 'photos',
          severity: 'warning',
        });
      }
      continue;
    }

    if (field.type === 'audio') {
      if (!hasTextValue(input.audio) && recipe.mediaLimits.minAudioTracks > 0) {
        errors.push({
          code: RECIPE_VALIDATION_CODES.AUDIO_REQUIRED,
          message: `${field.label} is required.`,
          target: 'audio',
          severity: 'error',
        });
      }
      continue;
    }

    if (field.type === 'image_slot') {
      const hasImage =
        hasTextValue(input.puzzleImage) || hasTextValue(input.fields[field.key]);
      if (!hasImage && recipe.mediaLimits.requiresPuzzleImage) {
        errors.push({
          code: RECIPE_VALIDATION_CODES.PUZZLE_IMAGE_REQUIRED,
          message: `${field.label} is required.`,
          target: field.key,
          severity: 'error',
        });
      }
      continue;
    }

    const value = input.fields[field.key];
    if (!hasTextValue(value)) {
      const alreadyReported = errors.some(
        (e) => e.target === field.key && e.code === RECIPE_VALIDATION_CODES.REQUIRED_FIELD_MISSING,
      );
      if (!alreadyReported) {
        errors.push({
          code: RECIPE_VALIDATION_CODES.REQUIRED_FIELD_MISSING,
          message: `${field.label} is required.`,
          target: field.key,
          severity: 'error',
        });
      }
    } else if (field.minLength && value.trim().length < field.minLength) {
      errors.push({
        code: RECIPE_VALIDATION_CODES.FIELD_TOO_SHORT,
        message: `${field.label} must be at least ${field.minLength} characters.`,
        target: field.key,
        severity: 'error',
      });
    } else if (field.maxLength && value.trim().length > field.maxLength) {
      errors.push({
        code: RECIPE_VALIDATION_CODES.FIELD_TOO_LONG,
        message: `${field.label} must be at most ${field.maxLength} characters.`,
        target: field.key,
        severity: 'error',
      });
    } else if (field.pattern && !new RegExp(field.pattern).test(value)) {
      errors.push({
        code: RECIPE_VALIDATION_CODES.FIELD_PATTERN_MISMATCH,
        message: `${field.label} format is invalid.`,
        target: field.key,
        severity: 'error',
      });
    }
  }

  validateMedia(recipe, input, errors, warnings);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

function evaluateRule(
  rule: RecipeValidationRule,
  input: RecipeInput,
  recipe: Recipe,
): RecipeValidationIssue | null {
  switch (rule.rule) {
    case 'required':
      return evaluateRequired(rule, input);
    case 'min_length':
      return evaluateMinLength(rule, input);
    case 'max_length':
      return evaluateMaxLength(rule, input);
    case 'min_items':
      return evaluateMinItems(rule, input, recipe);
    case 'max_items':
      return evaluateMaxItems(rule, input, recipe);
    case 'pattern':
      return evaluatePattern(rule, input);
    default:
      return null;
  }
}

function evaluateRequired(rule: RecipeValidationRule, input: RecipeInput): RecipeValidationIssue | null {
  if (rule.target === 'photos') {
    const count = input.photos?.filter(Boolean).length ?? 0;
    if (count === 0 && typeof rule.value === 'number' && rule.value > 0) {
      return issue(rule, 'error');
    }
    return null;
  }

  if (rule.target === 'audio') {
    if (!hasTextValue(input.audio)) return issue(rule, 'error');
    return null;
  }

  if (rule.target === RECIPE_FIELD_KEYS.PUZZLE_IMAGE) {
    if (!hasTextValue(input.puzzleImage) && !hasTextValue(input.fields[rule.target])) {
      return issue(rule, 'error');
    }
    return null;
  }

  if (!hasTextValue(input.fields[rule.target])) {
    return issue(rule, 'error');
  }

  return null;
}

function evaluateMinLength(rule: RecipeValidationRule, input: RecipeInput): RecipeValidationIssue | null {
  const value = input.fields[rule.target];
  if (!hasTextValue(value)) return null;
  const min = typeof rule.value === 'number' ? rule.value : 1;
  if (value.trim().length < min) return issue(rule, 'error');
  return null;
}

function evaluateMaxLength(rule: RecipeValidationRule, input: RecipeInput): RecipeValidationIssue | null {
  const value = input.fields[rule.target];
  if (!hasTextValue(value)) return null;
  const max = typeof rule.value === 'number' ? rule.value : Infinity;
  if (value.trim().length > max) return issue(rule, 'error');
  return null;
}

function evaluateMinItems(
  rule: RecipeValidationRule,
  input: RecipeInput,
  recipe: Recipe,
): RecipeValidationIssue | null {
  if (rule.target !== 'photos') return null;
  const min = typeof rule.value === 'number' ? rule.value : recipe.mediaLimits.minPhotos;
  const count = input.photos?.filter(Boolean).length ?? 0;
  if (count < min) return issue(rule, 'warning');
  return null;
}

function evaluateMaxItems(
  rule: RecipeValidationRule,
  input: RecipeInput,
  recipe: Recipe,
): RecipeValidationIssue | null {
  if (rule.target !== 'photos') return null;
  const max = typeof rule.value === 'number' ? rule.value : recipe.mediaLimits.maxPhotos;
  const count = input.photos?.filter(Boolean).length ?? 0;
  if (count > max) return issue(rule, 'error');
  return null;
}

function evaluatePattern(rule: RecipeValidationRule, input: RecipeInput): RecipeValidationIssue | null {
  const value = input.fields[rule.target];
  if (!hasTextValue(value)) return null;
  const pattern = typeof rule.value === 'string' ? rule.value : '';
  if (pattern && !new RegExp(pattern).test(value)) return issue(rule, 'error');
  return null;
}

function validateMedia(
  recipe: Recipe,
  input: RecipeInput,
  errors: RecipeValidationIssue[],
  warnings: RecipeValidationIssue[],
): void {
  const photoCount = input.photos?.filter(Boolean).length ?? 0;
  const { mediaLimits } = recipe;

  if (photoCount > mediaLimits.maxPhotos) {
    errors.push({
      code: RECIPE_VALIDATION_CODES.PHOTOS_ABOVE_MAX,
      message: `Maximum ${mediaLimits.maxPhotos} photos allowed.`,
      target: 'photos',
      severity: 'error',
    });
  }

  if (photoCount < mediaLimits.minPhotos) {
    errors.push({
      code: RECIPE_VALIDATION_CODES.PHOTOS_BELOW_MIN,
      message: `At least ${mediaLimits.minPhotos} photo(s) required.`,
      target: 'photos',
      severity: 'error',
    });
  }

  const hasAudio = hasTextValue(input.audio);
  if (mediaLimits.minAudioTracks > 0 && !hasAudio) {
    errors.push({
      code: RECIPE_VALIDATION_CODES.AUDIO_REQUIRED,
      message: 'Audio is required for this experience.',
      target: 'audio',
      severity: 'error',
    });
  }

  if (hasAudio && mediaLimits.maxAudioTracks === 0) {
    warnings.push({
      code: RECIPE_VALIDATION_CODES.AUDIO_NOT_ALLOWED,
      message: 'This recipe does not support audio; it will be ignored.',
      target: 'audio',
      severity: 'warning',
    });
  }

  if (mediaLimits.requiresPuzzleImage) {
    const hasPuzzle =
      hasTextValue(input.puzzleImage) ||
      hasTextValue(input.fields[RECIPE_FIELD_KEYS.PUZZLE_IMAGE]);
    if (!hasPuzzle) {
      errors.push({
        code: RECIPE_VALIDATION_CODES.PUZZLE_IMAGE_REQUIRED,
        message: 'Puzzle image is required.',
        target: RECIPE_FIELD_KEYS.PUZZLE_IMAGE,
        severity: 'error',
      });
    }
  }
}

function hasTextValue(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function issue(rule: RecipeValidationRule, severity: 'error' | 'warning'): RecipeValidationIssue {
  return {
    code: rule.code,
    message: rule.message,
    target: rule.target,
    severity,
  };
}

/**
 * Convenience wrapper — returns true when input passes all error-level checks.
 */
export function isValidRecipeInput(templateId: string, input: RecipeInput): boolean {
  return validateRecipe(templateId, input).valid;
}
