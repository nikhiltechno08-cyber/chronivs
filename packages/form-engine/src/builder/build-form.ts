import { getRecipe, type Recipe } from '@chronivs/recipe-engine';

import { FORM_SCHEMA_VERSION } from '../constants';
import type { FormDefinition, FormField, FormFieldValue } from '../types';

import { mapRecipeFieldToFormField } from './map-recipe-field';

export type BuildFormOptions = {
  /** Include optional recipe fields. Defaults to true. */
  readonly includeOptional?: boolean;
  /** Additional hidden fields appended to the form. */
  readonly hiddenFields?: readonly FormField[];
};

/**
 * Builds a complete {@link FormDefinition} from a {@link Recipe}.
 *
 * @param recipe - Source recipe definition
 * @param options - Build options
 * @returns Generated form with fields, defaults, and validation metadata
 */
export function buildFormFromRecipe(
  recipe: Recipe,
  options: BuildFormOptions = {},
): FormDefinition {
  const includeOptional = options.includeOptional ?? true;
  const fields: FormField[] = [];

  for (const field of recipe.requiredFields) {
    fields.push(mapRecipeFieldToFormField(field, recipe, true));
  }

  if (includeOptional) {
    for (const field of recipe.optionalFields) {
      fields.push(mapRecipeFieldToFormField(field, recipe, false));
    }
  }

  if (options.hiddenFields?.length) {
    fields.push(...options.hiddenFields);
  }

  const defaultValues = collectDefaultValues(fields, recipe);

  return {
    templateId: recipe.templateId,
    title: recipe.displayName,
    description: recipe.description,
    fields,
    defaultValues,
    schemaVersion: FORM_SCHEMA_VERSION,
  };
}

/**
 * Builds a form definition from a template id.
 * Returns null when no recipe is registered for the id.
 */
export function buildFormFromTemplateId(
  templateId: string,
  options?: BuildFormOptions,
): FormDefinition | null {
  const recipe = getRecipe(templateId);
  if (!recipe) return null;
  return buildFormFromRecipe(recipe, options);
}

/**
 * Returns a single field definition by id from a built form.
 */
export function getFormField(form: FormDefinition, fieldId: string): FormField | undefined {
  return form.fields.find((field) => field.id === fieldId);
}

function collectDefaultValues(
  fields: readonly FormField[],
  recipe: Recipe,
): Readonly<Record<string, FormFieldValue>> {
  const values: Record<string, FormFieldValue> = {};

  for (const field of fields) {
    if (field.defaultValue !== undefined) {
      values[field.id] = field.defaultValue as FormFieldValue;
      continue;
    }

    const recipeDefault = recipe.defaultValues[field.id];
    if (recipeDefault === undefined) {
      values[field.id] = defaultForType(field.type);
    } else if (Array.isArray(recipeDefault)) {
      values[field.id] = [...recipeDefault];
    } else {
      values[field.id] = recipeDefault as FormFieldValue;
    }
  }

  return values;
}

function defaultForType(type: FormField['type']): FormFieldValue {
  switch (type) {
    case 'checkbox':
      return false;
    case 'image_upload':
    case 'audio_upload':
      return [];
    case 'hidden':
      return null;
    default:
      return '';
  }
}
