/** Experience engine public surface — templates load via TEMPLATE_RENDERERS (lazy). */
export * from './core';
export * from './hooks';
export * from './renderers';
export { ExperiencePlayer } from './components/ExperiencePlayer';
export { CinematicEnding } from './shared/cinematic-ending';
export type { ExperienceViewMode } from './shared/cinematic-ending';
export { ExperienceProvider, useExperience, useOptionalExperience } from './context/ExperienceContext';
export {
  buildExperienceDataFromStudio,
  toExperienceInputData,
  toBackendExperienceData,
  fromBackendExperienceData,
  applyExperienceDataToStudio,
} from './adapters/experience-data-adapter';
export { validateExperienceData } from './validation/validateExperience';
export { useExperiencePersistence, type SaveStatus } from './persistence/useExperiencePersistence';
