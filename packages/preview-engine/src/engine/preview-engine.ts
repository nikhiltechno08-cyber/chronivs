import type { TemplateId } from '@chronivs/experience-core';
import type { Draft } from '@chronivs/draft-engine';
import {
  createExperienceRenderer,
  type RenderSceneResult,
} from '@chronivs/experience-renderer';

import { draftPayloadToExperience } from '../adapters/draft-to-experience.adapter';
import { PreviewSyncStatus, PreviewUpdateStrategy } from '../enums';
import {
  createPreviewControls,
  createPreviewStore,
  mergePreviewConfig,
  type PreviewStoreApi,
} from '../state';
import {
  computeStableScenes,
  detectChangedPayloadKeys,
  patchSceneMap,
  requiresFullReset,
  resolveAffectedScenes,
  scenesArrayToMap,
} from '../sync';
import type {
  PreviewControls,
  PreviewDraftPayload,
  PreviewEngineConfig,
  PreviewListener,
  PreviewState,
  PreviewSyncResult,
} from '../types';

/**
 * Live Preview Engine — orchestrates draft sync, selective rendering, and playback preservation.
 *
 * Subscribes to {@link DraftManager} — when draft data changes, preview updates automatically.
 * Does not modify Studio UI; consumed via adapter at composition root.
 */
export class PreviewEngine {
  private readonly store: PreviewStoreApi;
  private readonly config: ReturnType<typeof mergePreviewConfig>;
  private readonly listeners = new Set<PreviewListener>();
  private readonly controls: PreviewControls;

  private previousPayload: PreviewDraftPayload = {};
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private unsubscribeDraft: (() => void) | null = null;
  private renderer = createExperienceRenderer('birthday-girlfriend' as TemplateId);

  constructor(config: PreviewEngineConfig = {}) {
    this.config = mergePreviewConfig(config);
    this.store = createPreviewStore();
    this.controls = createPreviewControls(this.store, {
      onRestartExperience: () => this.restartExperience(),
      onRestartScene: () => undefined,
      onJumpToScene: (sceneId) => this.jumpToScene(sceneId),
    });
  }

  /** Zustand store API for React bindings. */
  getStore(): PreviewStoreApi {
    return this.store;
  }

  /** Preview control surface. */
  getControls(): PreviewControls {
    return this.controls;
  }

  /** Current preview state snapshot. */
  getState(): PreviewState {
    return this.store.getState();
  }

  /** Subscribe to state changes. */
  subscribe(listener: PreviewListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Bind to Draft Engine — auto-updates preview on draft mutations.
   */
  bindDraftManager<T extends Record<string, unknown>>(manager: {
    subscribe: (listener: (draft: Draft<T> | null) => void) => () => void;
    getActiveDraft: () => Draft<T> | null;
  }): () => void {
    this.unsubscribeDraft?.();

    this.unsubscribeDraft = manager.subscribe((draft) => {
      if (!draft) return;
      this.scheduleUpdate(draft.payload as PreviewDraftPayload);
    });

    const active = manager.getActiveDraft();
    if (active) {
      void this.sync(active.payload as PreviewDraftPayload, PreviewUpdateStrategy.Full);
    }

    return () => this.unsubscribeDraft?.();
  }

  /** Manual sync from draft payload (without DraftManager). */
  async sync(
    payload: PreviewDraftPayload,
    strategyHint?: PreviewUpdateStrategy,
  ): Promise<PreviewSyncResult> {
    const changedKeys = detectChangedPayloadKeys(this.previousPayload, payload);
    const fullReset = requiresFullReset(changedKeys) || strategyHint === PreviewUpdateStrategy.Full;

    this.store.getState().patch({
      syncStatus: PreviewSyncStatus.Syncing,
      pendingOptimistic: this.config.enableOptimistic && !fullReset,
    });
    this.notify();

    try {
      const templateId = (payload.templateId ?? 'birthday-girlfriend') as TemplateId;
      this.renderer = createExperienceRenderer(templateId);

      const experience = draftPayloadToExperience(payload);
      const rendered = this.renderer.renderExperience(experience);
      const sceneMap = scenesArrayToMap(rendered.scenes);

      let affectedSceneIds: string[];
      let strategy: PreviewUpdateStrategy;

      if (fullReset || this.previousPayload.templateId !== payload.templateId) {
        affectedSceneIds = rendered.sceneOrder.slice();
        strategy = PreviewUpdateStrategy.Full;
      } else {
        affectedSceneIds = resolveAffectedScenes(templateId, changedKeys);
        strategy = PreviewUpdateStrategy.Selective;
      }

      const currentScenes = this.store.getState().scenes;
      const patchedScenes = fullReset
        ? sceneMap
        : patchSceneMap(currentScenes, sceneMap, affectedSceneIds);

      const stableSceneIds = computeStableScenes(rendered.sceneOrder, affectedSceneIds);
      const playback = this.resolvePlaybackPreservation(rendered.sceneOrder, fullReset);

      const revision = this.store.getState().revision + 1;
      const nextState: PreviewState = {
        rendered,
        scenes: patchedScenes,
        dirtySceneIds: affectedSceneIds,
        stableSceneIds,
        playback,
        viewport: this.store.getState().viewport,
        syncStatus: PreviewSyncStatus.Ready,
        lastStrategy: strategy,
        revision,
        pendingOptimistic: false,
        error: null,
      };

      this.store.getState().patch(nextState);
      this.previousPayload = { ...payload };
      this.notify();

      return { state: nextState, affectedSceneIds, strategy };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Preview sync failed';
      this.store.getState().patch({
        syncStatus: PreviewSyncStatus.Error,
        error: message,
        pendingOptimistic: false,
      });
      this.notify();
      throw error;
    }
  }

  /** Optimistic immediate patch for text fields (before debounced confirm). */
  applyOptimisticPatch(patch: Partial<PreviewDraftPayload>): void {
    if (!this.config.enableOptimistic) return;

    const merged = { ...this.previousPayload, ...patch };
    const templateId = (merged.templateId ?? 'birthday-girlfriend') as TemplateId;
    const changedKeys = Object.keys(patch);
    const affectedSceneIds = resolveAffectedScenes(templateId, changedKeys);

    const experience = draftPayloadToExperience(merged);
    const updatedScenes: Record<string, RenderSceneResult> = {};

    for (const sceneId of affectedSceneIds) {
      updatedScenes[sceneId] = this.renderer.getSceneData(experience, sceneId);
    }

    const patched = patchSceneMap(this.store.getState().scenes, updatedScenes, affectedSceneIds);

    this.store.getState().patch({
      scenes: patched,
      dirtySceneIds: affectedSceneIds,
      pendingOptimistic: true,
      lastStrategy: PreviewUpdateStrategy.Optimistic,
    });
    this.notify();
  }

  /** Debounced update scheduler. */
  scheduleUpdate(payload: PreviewDraftPayload, changedKey?: string): void {
    if (this.config.enableOptimistic) {
      const patch: Partial<PreviewDraftPayload> = changedKey
        ? { [changedKey]: payload[changedKey] }
        : payload;
      this.applyOptimisticPatch(patch);
    }

    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    const delay = resolveDebounceDelay(changedKey, this.config);

    this.debounceTimer = setTimeout(() => {
      void this.sync(payload);
    }, delay);
  }

  /** Render a single scene (Layer 2 passthrough). */
  getSceneData(sceneId: string): RenderSceneResult | null {
    return this.store.getState().scenes[sceneId] ?? null;
  }

  /** Jump to scene — preserves animation generation (no restart). */
  jumpToScene(sceneId: string): void {
    const { rendered } = this.store.getState();
    if (!rendered) return;

    const index = rendered.sceneOrder.indexOf(sceneId);
    if (index === -1) return;

    this.store.getState().patch({
      playback: {
        currentSceneId: sceneId,
        currentSceneIndex: index,
        sceneProgress: 0,
      },
    });
    this.notify();
  }

  /** Restart experience from first scene. */
  restartExperience(): void {
    const { rendered, playback } = this.store.getState();
    const firstSceneId = rendered?.sceneOrder[0] ?? '';

    this.store.getState().patch({
      playback: {
        currentSceneId: firstSceneId,
        currentSceneIndex: 0,
        sceneProgress: 0,
        animationGeneration: playback.animationGeneration + 1,
        musicPlaying: true,
      },
    });
    this.notify();
  }

  /** Flush pending debounced sync immediately. */
  async flush(): Promise<void> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    await this.sync(this.previousPayload);
  }

  /** Dispose timers and subscriptions. */
  dispose(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.unsubscribeDraft?.();
    this.listeners.clear();
  }

  private resolvePlaybackPreservation(
    sceneOrder: readonly string[],
    fullReset: boolean,
  ): PreviewState['playback'] {
    const current = this.store.getState().playback;

    if (fullReset || !this.config.preservePlayback) {
      return {
        ...current,
        currentSceneId: sceneOrder[0] ?? '',
        currentSceneIndex: 0,
        sceneProgress: 0,
      };
    }

    const sceneStillExists = sceneOrder.includes(current.currentSceneId);
    const index = sceneStillExists
      ? sceneOrder.indexOf(current.currentSceneId)
      : Math.min(current.currentSceneIndex, sceneOrder.length - 1);

    return {
      ...current,
      currentSceneId: sceneStillExists ? current.currentSceneId : (sceneOrder[index] ?? ''),
      currentSceneIndex: index,
    };
  }

  private notify(): void {
    const state = this.getState();
    for (const listener of this.listeners) {
      listener(state);
    }
  }
}

function resolveDebounceDelay(
  changedKey: string | undefined,
  config: ReturnType<typeof mergePreviewConfig>,
): number {
  if (changedKey === 'photos' || changedKey === 'audio' || changedKey === 'puzzleImage') {
    return config.mediaDebounceMs;
  }
  if (
    changedKey === 'senderName' ||
    changedKey === 'receiverName' ||
    changedKey === 'customMessage' ||
    changedKey === 'letter' ||
    changedKey === 'specialDate'
  ) {
    return config.textDebounceMs;
  }
  return config.debounceMs;
}

/** Factory for local preview engine. */
export function createPreviewEngine(config?: PreviewEngineConfig): PreviewEngine {
  return new PreviewEngine(config);
}
