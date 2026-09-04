import { DEFAULT_MAX_HISTORY_VERSIONS } from '../constants';
import { DraftStatus } from '../enums/draft-status';
import { SyncStatus } from '../enums/sync-status';
import {
  applyPatch,
  clone as cloneDraft,
  createDraft,
} from '../operations/draft-factory';
import { restore as restoreDraft } from '../operations/restore';
import { autosave, bindAutosaveBeforeUnload, bindOfflineDetection, clear, load, save } from '../autosave';
import { createLocalDraftStorage } from '../storage/local-provider';
import type { Draft, DraftPatch } from '../types/draft';
import type { DraftId } from '../types/branded';
import type {
  AutosaveHandle,
  AutosaveOptions,
  DraftManagerConfig,
  DraftManagerListener,
  DraftStorageProvider,
  RestoreOptions,
} from '../types/storage';
import { isOffline } from '../utils';
import type { CreateDraftInput } from '../operations/draft-factory';

/**
 * Draft Manager — orchestrates draft CRUD, autosave, archive, and recovery.
 *
 * Storage is injected via {@link DraftStorageProvider}. Studio consumes this
 * through a future adapter without modifying existing UI components.
 */
export class DraftManager<TPayload extends Record<string, unknown> = Record<string, unknown>> {
  private activeDraft: Draft<TPayload> | null = null;
  private readonly listeners = new Set<DraftManagerListener>();
  private autosaveHandle: AutosaveHandle | null = null;
  private unbindOffline: (() => void) | null = null;
  private unbindUnload: (() => void) | null = null;

  private readonly maxHistoryVersions: number;
  private readonly autosaveDebounceMs: number;

  constructor(
    private readonly provider: DraftStorageProvider,
    config: DraftManagerConfig = {},
  ) {
    this.maxHistoryVersions = config.maxHistoryVersions ?? DEFAULT_MAX_HISTORY_VERSIONS;
    this.autosaveDebounceMs = config.autosaveDebounceMs ?? 1500;
  }

  /** Currently loaded draft. */
  getActiveDraft(): Draft<TPayload> | null {
    return this.activeDraft;
  }

  /** Subscribe to draft / index changes. */
  subscribe(listener: DraftManagerListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Initialize manager — loads active draft pointer from storage. */
  async initialize(): Promise<Draft<TPayload> | null> {
    const index = await this.provider.loadIndex();
    if (index.activeDraftId) {
      const draft = await this.provider.get(index.activeDraftId);
      if (draft) {
        this.activeDraft = draft as Draft<TPayload>;
      }
    }

    this.setupAutosave();
    await this.notify();
    return this.activeDraft;
  }

  /** Create a new draft and set it as active. */
  async createDraft(input: CreateDraftInput<TPayload>): Promise<Draft<TPayload>> {
    const draft = createDraft<TPayload>(input, this.maxHistoryVersions);
    await this.provider.put(draft);
    await this.setActiveDraftId(draft.id);
    this.activeDraft = draft;
    await this.notify();
    return draft;
  }

  /** Load a draft by id and set as active. */
  async loadDraft(id: DraftId): Promise<Draft<TPayload> | null> {
    const draft = await load(this.provider, id);
    if (!draft) return null;

    this.activeDraft = draft as Draft<TPayload>;
    await this.setActiveDraftId(id);
    await this.notify();
    return this.activeDraft;
  }

  /** Save the active draft (or a specific draft). */
  async saveDraft(draft?: Draft<TPayload>): Promise<Draft<TPayload>> {
    const target = draft ?? this.activeDraft;
    if (!target) {
      throw new Error('No draft to save');
    }

    const saved = await save({
      provider: this.provider,
      draft: { ...target, isDirty: false, offline: isOffline() } as Draft,
    });

    this.activeDraft = saved as Draft<TPayload>;
    await this.notify();
    return this.activeDraft;
  }

  /** Update active draft with a patch (triggers autosave when enabled). */
  async updateDraft(patch: DraftPatch<TPayload>): Promise<Draft<TPayload>> {
    if (!this.activeDraft) {
      throw new Error('No active draft to update');
    }

    const updated = applyPatch(this.activeDraft, patch);
    this.activeDraft = updated;
    await this.provider.put(updated);
    await this.notify();

    return updated;
  }

  /** Schedule debounced autosave for the active draft. */
  scheduleAutosave(patch: DraftPatch<TPayload>): void {
    const handle = this.autosaveHandle as AutosaveHandle & {
      schedule?: (p: DraftPatch<TPayload>) => void;
    };

    if (handle?.schedule) {
      handle.schedule(patch);
      return;
    }

    void this.updateDraft(patch);
  }

  /** Delete a draft permanently. */
  async deleteDraft(id: DraftId): Promise<void> {
    await this.provider.remove(id);

    if (this.activeDraft?.id === id) {
      this.activeDraft = null;
      await this.setActiveDraftId(null);
    }

    await this.notify();
  }

  /** Clone a draft into a new record. */
  async cloneDraft(id: DraftId, overrides?: DraftPatch<TPayload>): Promise<Draft<TPayload>> {
    const source = await load(this.provider, id);
    if (!source) {
      throw new Error(`Draft ${id} not found`);
    }

    const cloned = cloneDraft(source as Draft<TPayload>, overrides);
    await this.provider.put(cloned);
    await this.notify();
    return cloned;
  }

  /** Archive a draft (soft hide). */
  async archiveDraft(id: DraftId): Promise<Draft<TPayload>> {
    const draft = await load(this.provider, id);
    if (!draft) {
      throw new Error(`Draft ${id} not found`);
    }

    const archived = applyPatch(draft as Draft<TPayload>, {
      status: DraftStatus.Archived,
      isDirty: false,
    });

    await this.provider.put(archived);

    if (this.activeDraft?.id === id) {
      this.activeDraft = archived;
    }

    await this.notify();
    return archived;
  }

  /** Restore an archived draft to active status. */
  async restoreArchivedDraft(id: DraftId): Promise<Draft<TPayload>> {
    const draft = await load(this.provider, id);
    if (!draft) {
      throw new Error(`Draft ${id} not found`);
    }

    const restored = applyPatch(draft as Draft<TPayload>, {
      status: DraftStatus.Active,
    });

    await this.provider.put(restored);
    await this.notify();
    return restored;
  }

  /** Restore payload from version history. */
  restoreFromHistory(options?: RestoreOptions): Draft<TPayload> {
    if (!this.activeDraft) {
      throw new Error('No active draft to restore');
    }

    const restored = restoreDraft(this.activeDraft, options);
    this.activeDraft = restored;
    void this.provider.put(restored);
    void this.notify();
    return restored;
  }

  /** List all draft ids. */
  async listDraftIds(): Promise<DraftId[]> {
    return this.provider.listIds();
  }

  /** Clear all drafts from storage. */
  async clearAll(): Promise<void> {
    await clear(this.provider);
    this.activeDraft = null;
    await this.notify();
  }

  /** Enable autosave with optional overrides. */
  enableAutosave(options: AutosaveOptions = {}): AutosaveHandle {
    this.disposeAutosave();

    const handle = autosave<TPayload>(
      () => this.activeDraft,
      async (patch) => this.updateDraft(patch),
      { debounceMs: options.debounceMs ?? this.autosaveDebounceMs, ...options },
    );

    this.autosaveHandle = handle;
    this.unbindUnload = bindAutosaveBeforeUnload(handle);
    return handle;
  }

  /** Mark active draft as pending sync (future backend). */
  markPendingSync(): void {
    if (!this.activeDraft) return;

    this.activeDraft = applyPatch(this.activeDraft, {
      syncStatus: SyncStatus.Pending,
    });
    void this.provider.put(this.activeDraft);
  }

  /** Dispose listeners and autosave handles. */
  dispose(): void {
    this.disposeAutosave();
    this.listeners.clear();
    this.unbindOffline?.();
    this.unbindOffline = null;
  }

  private setupAutosave(): void {
    this.enableAutosave();
    this.unbindOffline = bindOfflineDetection((offline) => {
      if (this.activeDraft) {
        this.activeDraft = applyPatch(this.activeDraft, { offline });
      }
    });
  }

  private disposeAutosave(): void {
    this.autosaveHandle?.dispose();
    this.autosaveHandle = null;
    this.unbindUnload?.();
    this.unbindUnload = null;
  }

  private async setActiveDraftId(id: DraftId | null): Promise<void> {
    const index = await this.provider.loadIndex();
    await this.provider.saveIndex({
      ...index,
      activeDraftId: id,
    });
  }

  private async notify(): Promise<void> {
    const index = await this.provider.loadIndex();
    for (const listener of this.listeners) {
      listener(this.activeDraft as Draft | null, index);
    }
  }
}

/** Factory with local storage (default for architecture phase). */
export function createLocalDraftManager<
  TPayload extends Record<string, unknown> = Record<string, unknown>,
>(config?: DraftManagerConfig): DraftManager<TPayload> {
  return new DraftManager<TPayload>(createLocalDraftStorage(), config);
}
