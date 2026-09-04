import type { Recipe, RecipeField } from '@chronivs/recipe-engine';
import type { RecipeFieldType } from '@chronivs/recipe-engine';

import { RECIPE_TO_FORM_TYPE_MAP, VALIDATION_MESSAGES } from '../constants';
import type { FormField, FormFieldType, FormFieldValidation, FormValidationRule } from '../types';

/**
 * Maps a {@link RecipeFieldType} to a {@link FormFieldType}.
 */
export function mapRecipeFieldType(recipeType: RecipeFieldType): FormFieldType {
  return RECIPE_TO_FORM_TYPE_MAP[recipeType] as FormFieldType;
}

/**
 * Builds validation rules for a recipe field within the context of its parent recipe.
 */
export function buildFieldValidation(
  field: RecipeField,
  recipe: Recipe,
  required: boolean,
): FormFieldValidation {
  const rules: FormValidationRule[] = [];

  if (required) {
    rules.push({
      type: 'required',
      message: VALIDATION_MESSAGES.REQUIRED,
    });
  }

  if (field.minLength != null) {
    rules.push({
      type: 'min_length',
      value: field.minLength,
      message: VALIDATION_MESSAGES.MIN_LENGTH(field.minLength),
    });
  }

  if (field.maxLength != null) {
    rules.push({
      type: 'max_length',
      value: field.maxLength,
      message: VALIDATION_MESSAGES.MAX_LENGTH(field.maxLength),
    });
  }

  if (field.pattern) {
    rules.push({
      type: 'pattern',
      value: field.pattern,
      message: VALIDATION_MESSAGES.PATTERN,
    });
  }

  const { mediaLimits } = recipe;

  if (field.type === 'photo_collection') {
    if (mediaLimits.minPhotos > 0) {
      rules.push({
        type: 'min_files',
        value: mediaLimits.minPhotos,
        message: VALIDATION_MESSAGES.MIN_FILES(mediaLimits.minPhotos),
      });
    }
    rules.push({
      type: 'max_files',
      value: mediaLimits.maxPhotos,
      message: VALIDATION_MESSAGES.MAX_FILES(mediaLimits.maxPhotos),
    });
    if (mediaLimits.maxPhotoBytes) {
      rules.push({
        type: 'max_file_size',
        value: mediaLimits.maxPhotoBytes,
        message: VALIDATION_MESSAGES.MAX_FILE_SIZE(
          Math.round(mediaLimits.maxPhotoBytes / (1024 * 1024)),
        ),
      });
    }
    rules.push({
      type: 'allowed_types',
      value: [...mediaLimits.acceptedImageMimeTypes],
      message: VALIDATION_MESSAGES.ALLOWED_TYPES,
    });
  }

  if (field.type === 'image_slot') {
    rules.push({
      type: 'max_files',
      value: 1,
      message: VALIDATION_MESSAGES.MAX_FILES(1),
    });
    if (mediaLimits.maxPhotoBytes) {
      rules.push({
        type: 'max_file_size',
        value: mediaLimits.maxPhotoBytes,
        message: VALIDATION_MESSAGES.MAX_FILE_SIZE(
          Math.round(mediaLimits.maxPhotoBytes / (1024 * 1024)),
        ),
      });
    }
    rules.push({
      type: 'allowed_types',
      value: [...mediaLimits.acceptedImageMimeTypes],
      message: VALIDATION_MESSAGES.ALLOWED_TYPES,
    });
  }

  if (field.type === 'audio') {
    if (mediaLimits.minAudioTracks > 0) {
      rules.push({
        type: 'min_files',
        value: mediaLimits.minAudioTracks,
        message: VALIDATION_MESSAGES.MIN_FILES(mediaLimits.minAudioTracks),
      });
    }
    rules.push({
      type: 'max_files',
      value: mediaLimits.maxAudioTracks,
      message: VALIDATION_MESSAGES.MAX_FILES(mediaLimits.maxAudioTracks),
    });
    if (mediaLimits.maxAudioBytes) {
      rules.push({
        type: 'max_file_size',
        value: mediaLimits.maxAudioBytes,
        message: VALIDATION_MESSAGES.MAX_FILE_SIZE(
          Math.round(mediaLimits.maxAudioBytes / (1024 * 1024)),
        ),
      });
    }
    rules.push({
      type: 'allowed_types',
      value: [...mediaLimits.acceptedAudioMimeTypes],
      message: VALIDATION_MESSAGES.ALLOWED_TYPES,
    });
  }

  return { rules };
}

/**
 * Converts a single {@link RecipeField} into a {@link FormField}.
 */
export function mapRecipeFieldToFormField(
  field: RecipeField,
  recipe: Recipe,
  required: boolean,
): FormField {
  const formType = mapRecipeFieldType(field.type);
  const validation = buildFieldValidation(field, recipe, required);
  const defaultValue = resolveDefaultValue(field.key, recipe);

  const base: FormField = {
    id: field.key,
    type: formType,
    label: field.label,
    placeholder: field.placeholder,
    description: field.description,
    required,
    validation,
    defaultValue,
    helpText: field.description,
    maxLength: field.maxLength,
    minLength: field.minLength,
    meta: {
      recipeFieldType: field.type,
      templateId: recipe.templateId,
    },
  };

  if (field.type === 'photo_collection') {
    return {
      ...base,
      accept: [...recipe.mediaLimits.acceptedImageMimeTypes],
      maxFiles: recipe.mediaLimits.maxPhotos,
      maxFileSize: recipe.mediaLimits.maxPhotoBytes,
    };
  }

  if (field.type === 'image_slot') {
    return {
      ...base,
      accept: [...recipe.mediaLimits.acceptedImageMimeTypes],
      maxFiles: 1,
      maxFileSize: recipe.mediaLimits.maxPhotoBytes,
    };
  }

  if (field.type === 'audio') {
    return {
      ...base,
      accept: [...recipe.mediaLimits.acceptedAudioMimeTypes],
      maxFiles: recipe.mediaLimits.maxAudioTracks,
      maxFileSize: recipe.mediaLimits.maxAudioBytes,
    };
  }

  if (field.type === 'letter') {
    return {
      ...base,
      type: 'textarea',
      maxLength: field.maxLength ?? 2000,
    };
  }

  return base;
}

function resolveDefaultValue(
  fieldKey: string,
  recipe: Recipe,
): string | boolean | readonly string[] | null | undefined {
  const raw = recipe.defaultValues[fieldKey];
  if (raw === undefined) return null;
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string' || raw === null) return raw;
  return null;
}
