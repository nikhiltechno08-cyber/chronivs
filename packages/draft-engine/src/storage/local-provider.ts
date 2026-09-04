import { DRAFT_ENGINE_SCHEMA_VERSION, DEFAULT_STORAGE_KEY } from '../constants';
import type { Draft, DraftIndex } from '../types/draft';
import type { DraftId } from '../types/branded';
import type { DraftStorageProvider, LocalDraftStorageOptions } from '../types/storage';

const EMPTY_INDEX: DraftIndex = {
  drafts: {},
  activeDraftId: null,
  schemaVersion: DRAFT_ENGINE_SCHEMA_VERSION,
};

/**
 * Browser localStorage draft storage provider.
 */
export class LocalDraftStorageProvider implements DraftStorageProvider {
  readonly name = 'local';

  private readonly storageKey: string;

  constructor(options: LocalDraftStorageOptions = {}) {
    this.storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY;
  }

  async loadIndex(): Promise<DraftIndex> {
    if (typeof localStorage === 'undefined') {
      return { ...EMPTY_INDEX };
    }

    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return { ...EMPTY_INDEX };
      const parsed = JSON.parse(raw) as DraftIndex;
      return {
        drafts: parsed.drafts ?? {},
        activeDraftId: parsed.activeDraftId ?? null,
        schemaVersion: parsed.schemaVersion ?? DRAFT_ENGINE_SCHEMA_VERSION,
      };
    } catch {
      return { ...EMPTY_INDEX };
    }
  }

  async saveIndex(index: DraftIndex): Promise<void> {
    if (typeof localStorage === 'undefined') return;

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(index));
    } catch {
      // Quota exceeded — best-effort retry after clearing key
      try {
        localStorage.removeItem(this.storageKey);
        localStorage.setItem(this.storageKey, JSON.stringify(index));
      } catch {
        /* persist skipped */
      }
    }
  }

  async get(id: DraftId): Promise<Draft | null> {
    const index = await this.loadIndex();
    return index.drafts[id] ?? null;
  }

  async put(draft: Draft): Promise<void> {
    const index = await this.loadIndex();
    index.drafts[draft.id] = draft;
    await this.saveIndex(index);
  }

  async remove(id: DraftId): Promise<void> {
    const index = await this.loadIndex();
    delete index.drafts[id];
    if (index.activeDraftId === id) {
      index.activeDraftId = null;
    }
    await this.saveIndex(index);
  }

  async clear(): Promise<void> {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      /* ignore */
    }
  }

  async listIds(): Promise<DraftId[]> {
    const index = await this.loadIndex();
    return Object.keys(index.drafts) as DraftId[];
  }

  /** Set the active draft pointer in the index. */
  async setActiveDraftId(id: DraftId | null): Promise<void> {
    const index = await this.loadIndex();
    index.activeDraftId = id;
    await this.saveIndex(index);
  }

  /** Read active draft id from index. */
  async getActiveDraftId(): Promise<DraftId | null> {
    const index = await this.loadIndex();
    return index.activeDraftId;
  }
}

/** Default local provider singleton factory. */
export function createLocalDraftStorage(
  options?: LocalDraftStorageOptions,
): LocalDraftStorageProvider {
  return new LocalDraftStorageProvider(options);
}
