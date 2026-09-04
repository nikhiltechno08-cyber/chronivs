import type { FormField, FormFieldType } from '../types';

import type { FieldRenderDescriptor, FormRendererAdapter } from './types';

/** Default component keys per form field type (generic adapter). */
export const DEFAULT_COMPONENT_KEYS: Record<FormFieldType, string> = {
  text: 'TextInput',
  textarea: 'Textarea',
  date: 'DatePicker',
  image_upload: 'ImageUpload',
  audio_upload: 'AudioUpload',
  checkbox: 'Checkbox',
  select: 'Select',
  radio: 'RadioGroup',
  hidden: 'HiddenInput',
};

/**
 * Generic descriptor adapter — maps form fields to neutral component keys.
 * Use when no platform-specific adapter is registered.
 */
export class DescriptorFormAdapter implements FormRendererAdapter {
  readonly name: string = 'descriptor';

  mapField(field: FormField): FieldRenderDescriptor {
    return {
      fieldId: field.id,
      componentKey: resolveComponentKey(field),
      fieldType: field.type,
      props: buildBaseProps(field),
    };
  }

  mapFields(fields: readonly FormField[]): readonly FieldRenderDescriptor[] {
    return fields.map((field) => this.mapField(field));
  }
}

function resolveComponentKey(field: FormField): string {
  if (field.hidden) return DEFAULT_COMPONENT_KEYS.hidden;
  return DEFAULT_COMPONENT_KEYS[field.type];
}

function buildBaseProps(field: FormField): Readonly<Record<string, unknown>> {
  const props: Record<string, unknown> = {
    id: field.id,
    name: field.id,
    label: field.label,
    required: field.required,
  };

  if (field.placeholder) props.placeholder = field.placeholder;
  if (field.description) props.description = field.description;
  if (field.helpText) props.helpText = field.helpText;
  if (field.defaultValue !== undefined) props.defaultValue = field.defaultValue;
  if (field.maxLength != null) props.maxLength = field.maxLength;
  if (field.minLength != null) props.minLength = field.minLength;
  if (field.accept?.length) props.accept = field.accept.join(',');
  if (field.maxFiles != null) props.maxFiles = field.maxFiles;
  if (field.maxFileSize != null) props.maxFileSize = field.maxFileSize;
  if (field.options?.length) props.options = field.options;
  if (field.hidden) props.hidden = true;
  if (field.meta) props.meta = field.meta;

  return props;
}

/** Singleton generic adapter instance. */
export const descriptorFormAdapter = new DescriptorFormAdapter();

/**
 * Maps a field using the generic descriptor adapter.
 */
export function toRenderDescriptor(field: FormField): FieldRenderDescriptor {
  return descriptorFormAdapter.mapField(field);
}
