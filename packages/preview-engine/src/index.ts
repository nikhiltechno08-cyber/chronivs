/**
 * @chronivs/preview-engine
 *
 * Live Preview Engine — real-time experience preview with selective scene updates.
 * Architecture phase — no Studio UI wiring, no backend, no visual changes.
 */

// Engine
export { PreviewEngine, createPreviewEngine } from './engine';

// Enums
export {
  PreviewSyncStatus,
  PreviewUpdateStrategy,
  PreviewViewportMode,
  PREVIEW_VIEWPORT_MODES,
} from './enums';

// Types
export type {
  PlaybackState,
  PreviewAudioRef,
  PreviewControls,
  PreviewDraftPayload,
  PreviewEngineConfig,
  PreviewListener,
  PreviewPhotoRef,
  PreviewState,
  PreviewSyncResult,
  PreviewThemeRef,
  ServerPreviewProvider,
} from './types';

// Constants
export {
  DEFAULT_PHOTO_GRADIENTS,
  DEFAULT_PREVIEW_DEBOUNCE_MS,
  GLOBAL_SYNC_CHANNELS,
  MEDIA_DEBOUNCE_MS,
  PAYLOAD_FIELD_KEYS,
  PREVIEW_ENGINE_SCHEMA_VERSION,
  TEXT_FIELD_DEBOUNCE_MS,
  VIEWPORT_DIMENSIONS,
} from './constants';

// Adapters
export {
  draftPayloadToExperience,
  resolvePreviewPhotos,
  createServerPreviewProvider,
  LocalServerPreviewProvider,
} from './adapters';
export type { DraftToExperienceOptions } from './adapters';

// Sync utilities
export {
  computeStableScenes,
  detectChangedPayloadKeys,
  extractMediaDelta,
  extractThemeDelta,
  hasMissingMedia,
  mergeThemeSettings,
  patchSceneMap,
  requiresFullReset,
  resolveAffectedScenes,
  scenesArrayToMap,
} from './sync';

// State
export {
  createInitialPreviewState,
  createPreviewControls,
  createPreviewStore,
  INITIAL_PLAYBACK,
  INITIAL_PREVIEW_STATE,
  mergePreviewConfig,
  patchPreviewState,
  subscribePreviewStore,
} from './state';
export type { PreviewStatePatch, PreviewStore, PreviewStoreApi } from './state';
