import {
  buildFormFromRecipe,
  validateForm,
  type FormDefinition,
  type FormValidationResult,
  type FormValues,
} from '@chronivs/form-engine';
import type { Recipe } from '@chronivs/recipe-engine';

import type { FormPort } from '../../types/ports';

export class DefaultFormAdapter implements FormPort {
  readonly name = 'form-engine';

  buildForm(recipe: Recipe): FormDefinition {
    return buildFormFromRecipe(recipe);
  }

  validateForm(form: FormDefinition, values: FormValues): FormValidationResult {
    return validateForm(form, values);
  }
}

export function createFormPort(): FormPort {
  return new DefaultFormAdapter();
}
