import { PreviewSyncStatus, PreviewViewportMode } from '../enums';
import type { PlaybackState, PreviewEngineConfig, PreviewState } from '../types';

export const INITIAL_PLAYBACK: PlaybackState = {
  currentSceneId: '',
  currentSceneIndex: 0,
  sceneProgress: 0,
  animationGeneration: 0,
  musicPlaying: true,
  muted: false,
  fullscreen: false,
};

export const INITIAL_PREVIEW_STATE: PreviewState = {
  rendered: null,
  scenes: {},
  dirtySceneIds: [],
  stableSceneIds: [],
  playback: INITIAL_PLAYBACK,
  viewport: PreviewViewportMode.Desktop,
  syncStatus: PreviewSyncStatus.Idle,
  lastStrategy: null,
  revision: 0,
  pendingOptimistic: false,
  error: null,
};

export function createInitialPreviewState(
  overrides?: Partial<PreviewState>,
): PreviewState {
  return { ...INITIAL_PREVIEW_STATE, ...overrides };
}

export type PreviewStatePatch = Partial<Omit<PreviewState, 'playback'>> & {
  readonly playback?: Partial<PlaybackState>;
};

/** Immutable state patch helper. */
export function patchPreviewState(
  state: PreviewState,
  patch: PreviewStatePatch,
): PreviewState {
  return {
    ...state,
    ...patch,
    playback: patch.playback ? { ...state.playback, ...patch.playback } : state.playback,
  };
}

/** Default config merge. */
export function mergePreviewConfig(
  config: PreviewEngineConfig = {},
): Required<Pick<PreviewEngineConfig, 'debounceMs' | 'textDebounceMs' | 'mediaDebounceMs' | 'enableOptimistic' | 'preservePlayback'>> {
  return {
    debounceMs: config.debounceMs ?? 120,
    textDebounceMs: config.textDebounceMs ?? 80,
    mediaDebounceMs: config.mediaDebounceMs ?? 200,
    enableOptimistic: config.enableOptimistic !== false,
    preservePlayback: config.preservePlayback !== false,
  };
}
