/**
 * @chronivs/experience-integration
 *
 * Experience Integration Layer — Phase 2 orchestration hub.
 * Connects all Chronivs modules through replaceable ports.
 */

// Controller
export {
  ExperienceController,
  createExperienceController,
  ExperienceLifecycle,
} from './controller';

// Context
export {
  ExperienceContext,
  buildExperienceFromSession,
  buildPreviewPayload,
  createEmptySnapshot,
  formValuesToDraftPayload,
} from './context';

// Service
export { ExperienceService } from './service';

// Ports & default adapters
export {
  createDefaultModulePorts,
  createDraftPort,
  createFormPort,
  createPreviewPort,
  createRecipePort,
  createRendererPort,
  createUploadPort,
  createValidationPort,
  createStubAuthPort,
  createStubExperienceApiPort,
  createStubPublishPort,
} from './ports';

// Enums
export {
  EXPERIENCE_LIFECYCLE_VALUES,
  LIFECYCLE_PROGRESSION,
  isExperienceLifecycle,
} from './enums';

// Types
export type {
  AuthPort,
  CreateExperienceOptions,
  DraftPort,
  ExperienceApiPort,
  ExperienceContextListener,
  ExperienceContextSnapshot,
  ExperienceControllerConfig,
  ExperienceModulePorts,
  FormPort,
  PreviewOptions,
  PreviewPort,
  PublishPort,
  RecipePort,
  RendererPort,
  UpdateContentInput,
  UpdateMediaInput,
  UploadPort,
  ValidateOptions,
  ValidationPort,
} from './types';
