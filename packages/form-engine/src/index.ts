/**
 * @chronivs/form-engine
 *
 * Dynamic Form Engine for Chronivs V2.
 *
 * Generates form definitions and validation from Recipe metadata.
 * Pure TypeScript — no UI, no React runtime, no Studio coupling.
 *
 * @packageDocumentation
 */

// Builder
export {
  buildFieldValidation,
  buildFormFromRecipe,
  buildFormFromTemplateId,
  buildFormRenderDescriptor,
  getFormField,
  mapRecipeFieldToFormField,
  mapRecipeFieldType,
} from './builder';

export type { BuildFormOptions } from './builder';

// Validation
export {
  getFieldError,
  isFieldValid,
  isFormValid,
  validateField,
  validateForm,
  validateFormFields,
} from './validation';

// Renderer adapters (prepared — not wired to Studio)
export {
  DEFAULT_COMPONENT_KEYS,
  DescriptorFormAdapter,
  descriptorFormAdapter,
  ReactStudioFormAdapter,
  reactStudioFormAdapter,
  STUDIO_COMPONENT_KEYS,
  toRenderDescriptor,
} from './adapters';

export type {
  FieldRenderDescriptor,
  FormRenderDescriptor,
  FormRendererAdapter,
} from './adapters';

// Types
export type {
  FormDefinition,
  FormField,
  FormFieldError,
  FormFieldOption,
  FormFieldType,
  FormFieldValidation,
  FormFieldValue,
  FormFileMeta,
  FormValidationResult,
  FormValidationRule,
  FormValidationRuleType,
  FormValues,
} from './types';

// Constants
export { FORM_SCHEMA_VERSION, RECIPE_TO_FORM_TYPE_MAP, VALIDATION_MESSAGES } from './constants';
