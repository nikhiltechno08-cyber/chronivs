import type { Experience } from '@chronivs/experience-core';
import { validateExperience } from '@chronivs/experience-core';
import {
  validateForm,
  type FormDefinition,
  type FormValidationResult,
  type FormValues,
} from '@chronivs/form-engine';

import type { ValidationPort } from '../../types/ports';

export class DefaultValidationAdapter implements ValidationPort {
  readonly name = 'experience-core+form-engine';

  validateExperience(experience: Experience) {
    const result = validateExperience(experience);
    return {
      valid: result.valid,
      errors: result.errors.map((e) => e.message),
    };
  }

  validateForm(form: FormDefinition, values: FormValues): FormValidationResult {
    return validateForm(form, values);
  }
}

export function createValidationPort(): ValidationPort {
  return new DefaultValidationAdapter();
}
