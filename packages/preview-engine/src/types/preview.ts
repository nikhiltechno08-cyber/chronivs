import type { RenderedExperience, RenderSceneResult } from '@chronivs/experience-renderer';

import type { PreviewSyncStatus, PreviewUpdateStrategy, PreviewViewportMode } from '../enums';

/** Playback state preserved across draft updates. */
export interface PlaybackState {
  /** Active scene identifier. */
  readonly currentSceneId: string;
  /** Zero-based index in scene order. */
  readonly currentSceneIndex: number;
  /** Progress within current scene (0–1). */
  readonly sceneProgress: number;
  /**
   * Monotonic generation counter — bump only on scene restart.
   * Scene components key animations on this to preserve state otherwise.
   */
  readonly animationGeneration: number;
  /** Whether ambient/music is playing. */
  readonly musicPlaying: boolean;
  /** Mute state independent of play/pause. */
  readonly muted: boolean;
  /** Fullscreen preview active. */
  readonly fullscreen: boolean;
}

/** Live preview engine state snapshot. */
export interface PreviewState {
  /** Full rendered experience plan. */
  readonly rendered: RenderedExperience | null;
  /** Per-scene scoped props (Layer 2 output). */
  readonly scenes: Readonly<Record<string, RenderSceneResult>>;
  /** Scene ids requiring React re-render. */
  readonly dirtySceneIds: readonly string[];
  /** Scene ids unchanged — skip React reconciliation. */
  readonly stableSceneIds: readonly string[];
  /** Preserved playback position and animation state. */
  readonly playback: PlaybackState;
  /** Active viewport mode. */
  readonly viewport: PreviewViewportMode;
  /** Sync lifecycle status. */
  readonly syncStatus: PreviewSyncStatus;
  /** Last update strategy applied. */
  readonly lastStrategy: PreviewUpdateStrategy | null;
  /** Draft revision counter for debugging. */
  readonly revision: number;
  /** Optimistic patch pending confirmation. */
  readonly pendingOptimistic: boolean;
  /** Last error message. */
  readonly error: string | null;
}

/** Draft payload shape expected by preview adapters (Studio-compatible). */
export interface PreviewDraftPayload extends Record<string, unknown> {
  readonly templateId?: string;
  readonly occasion?: string;
  readonly relationship?: string;
  readonly senderName?: string;
  readonly receiverName?: string;
  readonly specialDate?: string;
  readonly customMessage?: string;
  readonly letter?: string;
  readonly photos?: readonly PreviewPhotoRef[];
  readonly audio?: PreviewAudioRef | null;
  readonly puzzleImage?: string | null;
  readonly theme?: PreviewThemeRef;
}

export interface PreviewPhotoRef {
  readonly id?: string;
  readonly url?: string;
  readonly dataUrl?: string;
  readonly previewUrl?: string;
  readonly order?: number;
}

export interface PreviewAudioRef {
  readonly url?: string;
  readonly dataUrl?: string;
}

export interface PreviewThemeRef {
  readonly mode?: 'light' | 'dark' | 'auto';
  readonly accentColor?: string;
  readonly presetId?: string;
}

/** Result of a preview sync operation. */
export interface PreviewSyncResult {
  readonly state: PreviewState;
  readonly affectedSceneIds: readonly string[];
  readonly strategy: PreviewUpdateStrategy;
}

/** Preview engine configuration. */
export interface PreviewEngineConfig {
  readonly debounceMs?: number;
  readonly textDebounceMs?: number;
  readonly mediaDebounceMs?: number;
  readonly enableOptimistic?: boolean;
  readonly preservePlayback?: boolean;
}

/** Preview control commands. */
export interface PreviewControls {
  readonly restartExperience: () => void;
  readonly restartCurrentScene: () => void;
  readonly jumpToScene: (sceneId: string) => void;
  readonly jumpToSceneIndex: (index: number) => void;
  readonly toggleMusic: () => void;
  readonly setMuted: (muted: boolean) => void;
  readonly toggleMute: () => void;
  readonly setFullscreen: (fullscreen: boolean) => void;
  readonly toggleFullscreen: () => void;
  readonly setViewport: (mode: PreviewViewportMode) => void;
}

/** Listener for preview state changes. */
export type PreviewListener = (state: PreviewState) => void;

/** Server-side preview provider contract (future). */
export interface ServerPreviewProvider {
  readonly name: string;
  renderPreview(experienceJson: string): Promise<RenderedExperience>;
}

export type { PreviewSyncStatus, PreviewUpdateStrategy, PreviewViewportMode };
