import { createStore } from 'zustand/vanilla';

import { PreviewSyncStatus, PreviewViewportMode } from '../enums';
import type { PreviewControls, PreviewListener, PreviewState } from '../types';

import {
  INITIAL_PLAYBACK,
  INITIAL_PREVIEW_STATE,
  patchPreviewState,
  type PreviewStatePatch,
} from './preview-state';

export type PreviewStore = PreviewState & {
  /** Apply immutable state patch. */
  patch: (patch: PreviewStatePatch) => void;
  /** Reset to initial state (template change). */
  reset: (firstSceneId?: string) => void;
};

export function createPreviewStore(initial?: Partial<PreviewState>) {
  return createStore<PreviewStore>((set) => ({
    ...INITIAL_PREVIEW_STATE,
    ...initial,

    patch: (patch) =>
      set((state) => patchPreviewState(state, patch)),

    reset: (firstSceneId) =>
      set({
        ...INITIAL_PREVIEW_STATE,
        playback: {
          ...INITIAL_PLAYBACK,
          currentSceneId: firstSceneId ?? '',
          currentSceneIndex: 0,
        },
        viewport: PreviewViewportMode.Desktop,
        syncStatus: PreviewSyncStatus.Idle,
      }),
  }));
}

export type PreviewStoreApi = ReturnType<typeof createPreviewStore>;

/** Subscribe to preview store changes. */
export function subscribePreviewStore(
  store: PreviewStoreApi,
  listener: PreviewListener,
): () => void {
  return store.subscribe((state) => listener(state));
}

/** Build preview controls bound to store + engine callbacks. */
export function createPreviewControls(
  store: PreviewStoreApi,
  callbacks: {
    readonly onRestartExperience: () => void;
    readonly onRestartScene: () => void;
    readonly onJumpToScene: (sceneId: string) => void;
  },
): PreviewControls {
  return {
    restartExperience: () => {
      callbacks.onRestartExperience();
    },

    restartCurrentScene: () => {
      const { playback } = store.getState();
      store.getState().patch({
        playback: {
          sceneProgress: 0,
          animationGeneration: playback.animationGeneration + 1,
        },
      });
      callbacks.onRestartScene();
    },

    jumpToScene: (sceneId) => {
      callbacks.onJumpToScene(sceneId);
    },

    jumpToSceneIndex: (index) => {
      const { rendered } = store.getState();
      const sceneId = rendered?.sceneOrder[index];
      if (sceneId) callbacks.onJumpToScene(sceneId);
    },

    toggleMusic: () => {
      const { playback } = store.getState();
      store.getState().patch({
        playback: { musicPlaying: !playback.musicPlaying },
      });
    },

    setMuted: (muted) => {
      store.getState().patch({ playback: { muted } });
    },

    toggleMute: () => {
      const { playback } = store.getState();
      store.getState().patch({ playback: { muted: !playback.muted } });
    },

    setFullscreen: (fullscreen) => {
      store.getState().patch({ playback: { fullscreen } });
    },

    toggleFullscreen: () => {
      const { playback } = store.getState();
      store.getState().patch({ playback: { fullscreen: !playback.fullscreen } });
    },

    setViewport: (viewport) => {
      store.getState().patch({ viewport });
    },
  };
}
