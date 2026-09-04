import type { FormDefinition } from '../types';
import type { FormRenderDescriptor } from '../adapters/types';
import { descriptorFormAdapter } from '../adapters/descriptor-adapter';

/**
 * Converts a built form definition into render descriptors via an adapter.
 */
export function buildFormRenderDescriptor(form: FormDefinition): FormRenderDescriptor {
  return {
    templateId: form.templateId,
    title: form.title,
    description: form.description,
    fields: descriptorFormAdapter.mapFields(form.fields),
  };
}
