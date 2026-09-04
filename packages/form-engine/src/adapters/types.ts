import type { FormField, FormFieldType } from '../types';

/**
 * Platform-agnostic render descriptor produced by renderer adapters.
 * UI frameworks map `componentKey` to actual components at integration time.
 */
export interface FieldRenderDescriptor {
  /** Stable field id passed to the control. */
  readonly fieldId: string;
  /** Adapter-specific component identifier (e.g. `FloatingInput`). */
  readonly componentKey: string;
  /** Props to spread onto the target component — JSON-serializable only. */
  readonly props: Readonly<Record<string, unknown>>;
  /** Original form field type for debugging. */
  readonly fieldType: FormFieldType;
}

/**
 * Descriptor for an entire generated form.
 */
export interface FormRenderDescriptor {
  readonly templateId: string;
  readonly title: string;
  readonly description: string;
  readonly fields: readonly FieldRenderDescriptor[];
}

/**
 * Contract for renderer adapters.
 * Implementations translate {@link FormField} definitions into render descriptors
 * without performing actual UI rendering.
 */
export interface FormRendererAdapter {
  /** Adapter name for logging and feature flags. */
  readonly name: string;
  /** Maps a single field to a render descriptor. */
  mapField(field: FormField): FieldRenderDescriptor;
  /** Maps all fields in sequence. */
  mapFields(fields: readonly FormField[]): readonly FieldRenderDescriptor[];
}
