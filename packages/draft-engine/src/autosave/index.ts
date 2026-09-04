import { DEFAULT_AUTOSAVE_DEBOUNCE_MS } from '../constants';
import type { Draft, DraftPatch } from '../types/draft';
import type { DraftStorageProvider, AutosaveHandle, AutosaveOptions } from '../types/storage';
import { isOffline } from '../utils';

export interface SaveContext {
  readonly provider: DraftStorageProvider;
  readonly draft: Draft;
}

/**
 * Persist a draft through the storage provider.
 */
export async function save(context: SaveContext): Promise<Draft> {
  const saved: Draft = {
    ...context.draft,
    isDirty: false,
    offline: isOffline(),
    updatedAt: context.draft.updatedAt,
  };

  await context.provider.put(saved);
  return saved;
}

/**
 * Load a draft by id from the storage provider.
 */
export async function load(
  provider: DraftStorageProvider,
  id: Draft['id'],
): Promise<Draft | null> {
  return provider.get(id);
}

/**
 * Clear all drafts from storage.
 */
export async function clear(provider: DraftStorageProvider): Promise<void> {
  await provider.clear();
}

/**
 * Debounced autosave — schedules saves on payload changes.
 *
 * Returns a handle to flush pending saves or cancel.
 */
export function autosave<TPayload extends Record<string, unknown>>(
  getDraft: () => Draft<TPayload> | null,
  patchAndSave: (patch: DraftPatch<TPayload>) => Promise<Draft<TPayload>>,
  options: AutosaveOptions = {},
): AutosaveHandle {
  const debounceMs = options.debounceMs ?? DEFAULT_AUTOSAVE_DEBOUNCE_MS;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pendingPatch: DraftPatch<TPayload> | null = null;
  let disposed = false;

  const schedule = (patch: DraftPatch<TPayload>) => {
    if (disposed) return;

    pendingPatch = pendingPatch
      ? { ...pendingPatch, ...patch, payload: { ...pendingPatch.payload, ...patch.payload } as Partial<TPayload> }
      : patch;

    if (timer) clearTimeout(timer);

    timer = setTimeout(() => {
      void flush();
    }, debounceMs);
  };

  const flush = async (): Promise<void> => {
    if (disposed || !pendingPatch) return;

    const patch = pendingPatch;
    pendingPatch = null;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    try {
      const saved = await patchAndSave(patch);
      options.onSave?.(saved);
    } catch (error) {
      options.onError?.(error);
    }
  };

  const cancel = (): void => {
    if (timer) clearTimeout(timer);
    timer = null;
    pendingPatch = null;
  };

  const dispose = (): void => {
    disposed = true;
    cancel();
  };

  // Expose schedule via symbol on handle for manager integration
  const handle = {
    flush,
    cancel,
    dispose,
    schedule,
    getDraft,
  } as AutosaveHandle & {
    schedule: (patch: DraftPatch<TPayload>) => void;
    getDraft: () => Draft<TPayload> | null;
  };

  return handle;
}

/** Flush autosave before page unload (browser). */
export function bindAutosaveBeforeUnload(handle: AutosaveHandle): () => void {
  if (typeof window === 'undefined') return () => undefined;

  const listener = () => {
    void handle.flush();
  };

  window.addEventListener('beforeunload', listener);
  return () => window.removeEventListener('beforeunload', listener);
}

/** Listen for online/offline transitions to flag drafts. */
export function bindOfflineDetection(onChange: (offline: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => undefined;

  const handler = () => onChange(isOffline());
  window.addEventListener('online', handler);
  window.addEventListener('offline', handler);
  return () => {
    window.removeEventListener('online', handler);
    window.removeEventListener('offline', handler);
  };
}

export { restore } from '../operations/restore';
export { clone } from '../operations/draft-factory';
export { serialize, serializeToObject } from '../operations/serialize';
export { deserialize, deserializeObject } from '../operations/deserialize';
