/**
 * Prepared adapter for future Chronivs Studio integration.
 *
 * Maps {@link FormField} types to existing Studio component names WITHOUT
 * importing or modifying Studio code. Integration happens in a future adapter
 * layer that swaps hardcoded forms for `buildFormFromRecipe()` output.
 *
 * Component keys match current Studio primitives (read-only reference):
 * - FloatingInput, FloatingTextarea, DatePicker, MessageInput
 * - MediaUploader, AudioRecorder
 */
import type { FormField, FormFieldType } from '../types';

import { DescriptorFormAdapter } from './descriptor-adapter';
import type { FieldRenderDescriptor, FormRendererAdapter } from './types';

/** Studio component keys — string constants only, no runtime coupling. */
export const STUDIO_COMPONENT_KEYS = {
  FLOATING_INPUT: 'FloatingInput',
  FLOATING_TEXTAREA: 'FloatingTextarea',
  MESSAGE_INPUT: 'MessageInput',
  DATE_PICKER: 'DatePicker',
  MEDIA_UPLOADER: 'MediaUploader',
  AUDIO_RECORDER: 'AudioRecorder',
  HIDDEN: 'HiddenInput',
} as const;

const STUDIO_FIELD_MAP: Partial<Record<FormFieldType, string>> = {
  text: STUDIO_COMPONENT_KEYS.FLOATING_INPUT,
  textarea: STUDIO_COMPONENT_KEYS.FLOATING_TEXTAREA,
  date: STUDIO_COMPONENT_KEYS.DATE_PICKER,
  image_upload: STUDIO_COMPONENT_KEYS.MEDIA_UPLOADER,
  audio_upload: STUDIO_COMPONENT_KEYS.AUDIO_RECORDER,
  hidden: STUDIO_COMPONENT_KEYS.HIDDEN,
};

/**
 * Renderer adapter prepared for future Studio wiring.
 * NOT used by the current Studio — safe to import in integration tests only.
 */
export class ReactStudioFormAdapter extends DescriptorFormAdapter implements FormRendererAdapter {
  override readonly name: string = 'react-studio';

  override mapField(field: FormField): FieldRenderDescriptor {
    const base = super.mapField(field);
    const componentKey = resolveStudioComponent(field);

    return {
      ...base,
      componentKey,
      props: {
        ...base.props,
        validationRules: field.validation.rules,
        registerName: field.id,
      },
    };
  }
}

function resolveStudioComponent(field: FormField): string {
  if (field.hidden) return STUDIO_COMPONENT_KEYS.HIDDEN;

  if (field.meta?.recipeFieldType === 'letter') {
    return STUDIO_COMPONENT_KEYS.MESSAGE_INPUT;
  }

  if (field.id === 'custom_message' && field.type === 'textarea') {
    return STUDIO_COMPONENT_KEYS.MESSAGE_INPUT;
  }

  return STUDIO_FIELD_MAP[field.type] ?? STUDIO_COMPONENT_KEYS.FLOATING_INPUT;
}

/** Singleton Studio adapter — prepared, not wired. */
export const reactStudioFormAdapter = new ReactStudioFormAdapter();
