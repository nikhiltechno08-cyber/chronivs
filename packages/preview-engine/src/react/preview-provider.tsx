'use client';

import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { useStore } from 'zustand';

import type { RenderSceneResult } from '@chronivs/experience-renderer';

import type { PreviewEngine } from '../engine/preview-engine';
import type { PreviewControls, PreviewDraftPayload, PreviewEngineConfig } from '../types';

import { createPreviewEngine } from '../engine/preview-engine';

type PreviewEngineContextValue = {
  readonly engine: PreviewEngine;
  readonly controls: PreviewControls;
};

const PreviewEngineContext = createContext<PreviewEngineContextValue | null>(null);

export type PreviewEngineProviderProps = {
  readonly children: ReactNode;
  readonly engine?: PreviewEngine;
  readonly config?: PreviewEngineConfig;
};

/**
 * React context provider for the Live Preview Engine.
 * Not wired to Studio — consumed via future adapter at composition root.
 */
export function PreviewEngineProvider({
  children,
  engine: externalEngine,
  config,
}: PreviewEngineProviderProps) {
  const engineRef = useRef<PreviewEngine | null>(externalEngine ?? null);

  if (!engineRef.current) {
    engineRef.current = externalEngine ?? createPreviewEngine(config);
  }

  const engine = engineRef.current;
  const controls = useMemo(() => engine.getControls(), [engine]);

  const value = useMemo(
    () => ({ engine, controls }),
    [engine, controls],
  );

  useEffect(() => () => engine.dispose(), [engine]);

  return (
    <PreviewEngineContext.Provider value={value}>
      {children}
    </PreviewEngineContext.Provider>
  );
}

/** Access the preview engine instance. */
export function usePreviewEngine(): PreviewEngineContextValue {
  const ctx = useContext(PreviewEngineContext);
  if (!ctx) {
    throw new Error('usePreviewEngine must be used within PreviewEngineProvider');
  }
  return ctx;
}

/** Subscribe to full preview state. */
export function usePreviewState<T>(selector: (state: ReturnType<PreviewEngine['getState']>) => T): T {
  const { engine } = usePreviewEngine();
  return useStore(engine.getStore(), selector);
}

/**
 * Selective scene props hook — only re-renders when THIS scene's props change.
 *
 * Uses stable reference equality from patchSceneMap for unaffected scenes.
 */
export function usePreviewSceneProps(sceneId: string): RenderSceneResult | null {
  return usePreviewState(
    useCallback(
      (state) => state.scenes[sceneId] ?? null,
      [sceneId],
    ),
  );
}

/** Whether a scene is in the dirty set (needs React reconciliation). */
export function usePreviewSceneDirty(sceneId: string): boolean {
  return usePreviewState(
    useCallback(
      (state) => state.dirtySceneIds.includes(sceneId),
      [sceneId],
    ),
  );
}

/** Preview playback state — isolated subscription. */
export function usePreviewPlayback() {
  return usePreviewState((state) => state.playback);
}

/** Preview controls (restart, jump, mute, viewport). */
export function usePreviewControls(): PreviewControls {
  const { controls } = usePreviewEngine();
  return controls;
}

/** Viewport mode + dimensions. */
export function usePreviewViewport() {
  return usePreviewState((state) => state.viewport);
}

/** Sync status indicator. */
export function usePreviewSyncStatus() {
  return usePreviewState((state) => state.syncStatus);
}

/** Bind draft manager and expose sync helper. */
export function usePreviewDraftBinding(
  manager: Parameters<PreviewEngine['bindDraftManager']>[0] | null,
): void {
  const { engine } = usePreviewEngine();

  useEffect(() => {
    if (!manager) return undefined;
    return engine.bindDraftManager(manager);
  }, [engine, manager]);
}

/** Manual payload sync (testing / adapter use). */
export function usePreviewSync() {
  const { engine } = usePreviewEngine();

  return useCallback(
    (payload: PreviewDraftPayload) => engine.scheduleUpdate(payload),
    [engine],
  );
}

export type PreviewSceneGateProps = {
  readonly sceneId: string;
  readonly children: (props: Readonly<Record<string, unknown>>, meta: RenderSceneResult['metadata']) => ReactNode;
  readonly fallback?: ReactNode;
};

/**
 * Memoized scene gate — skips React reconciliation when scene props are stable.
 *
 * Scene components receive ONLY scoped props, never the full Experience.
 */
export const PreviewSceneGate = memo(function PreviewSceneGate({
  sceneId,
  children,
  fallback = null,
}: PreviewSceneGateProps) {
  const scene = usePreviewSceneProps(sceneId);

  if (!scene) return fallback;

  return children(scene.props, scene.metadata);
});

PreviewSceneGate.displayName = 'PreviewSceneGate';

export type PreviewViewportFrameProps = {
  readonly children: ReactNode;
  readonly className?: string;
};

/** Viewport frame wrapper — applies mode dimensions without changing template CSS. */
export const PreviewViewportFrame = memo(function PreviewViewportFrame({
  children,
  className,
}: PreviewViewportFrameProps) {
  const viewport = usePreviewViewport();

  return (
    <div
      className={className}
      data-preview-viewport={viewport}
      style={{ contain: 'layout style paint' }}
    >
      {children}
    </div>
  );
});

PreviewViewportFrame.displayName = 'PreviewViewportFrame';
