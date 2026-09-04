import type { ExperienceModulePorts } from '../types/ports';

import { createDraftPort } from './adapters/draft.adapter';
import { createFormPort } from './adapters/form.adapter';
import { createPreviewPort } from './adapters/preview.adapter';
import { createRecipePort } from './adapters/recipe.adapter';
import { createRendererPort } from './adapters/renderer.adapter';
import { createUploadPort } from './adapters/upload.adapter';
import { createValidationPort } from './adapters/validation.adapter';

/** Wire default local module adapters (architecture phase). */
export function createDefaultModulePorts(
  overrides?: Partial<ExperienceModulePorts>,
): ExperienceModulePorts {
  return {
    recipe: createRecipePort(),
    form: createFormPort(),
    draft: createDraftPort(),
    upload: createUploadPort(),
    renderer: createRendererPort(),
    preview: createPreviewPort(),
    validation: createValidationPort(),
    ...overrides,
  };
}

export { createDraftPort } from './adapters/draft.adapter';
export { createFormPort } from './adapters/form.adapter';
export { createPreviewPort } from './adapters/preview.adapter';
export { createRecipePort } from './adapters/recipe.adapter';
export { createRendererPort } from './adapters/renderer.adapter';
export { createUploadPort } from './adapters/upload.adapter';
export { createValidationPort } from './adapters/validation.adapter';
export {
  createStubAuthPort,
  createStubExperienceApiPort,
  createStubPublishPort,
  StubAuthAdapter,
  StubExperienceApiAdapter,
  StubPublishAdapter,
} from './adapters/future.adapters';

export type { DefaultDraftAdapter } from './adapters/draft.adapter';
export type { DefaultPreviewAdapter } from './adapters/preview.adapter';
export type { DefaultUploadAdapter } from './adapters/upload.adapter';
