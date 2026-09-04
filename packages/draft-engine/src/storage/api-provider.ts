import type { Draft } from '../types/draft';
import type { DraftId } from '../types/branded';
import type { ApiDraftStorageConfig, DraftIndex, DraftStorageProvider } from '../types/storage';

/**
 * Backend API storage provider — architecture stub.
 *
 * Implements {@link DraftStorageProvider} for future REST/GraphQL sync.
 * No network calls in this phase.
 *
 * @see packages/draft-engine/README.md — Backend Synchronization
 */
export class ApiDraftStorageProvider implements DraftStorageProvider {
  readonly name = 'api';

  constructor(private readonly _config: ApiDraftStorageConfig) {
    void this._config;
  }

  async loadIndex(): Promise<DraftIndex> {
    throw new Error(
      'ApiDraftStorageProvider is not wired yet. Use LocalDraftStorageProvider.',
    );
  }

  async saveIndex(_index: DraftIndex): Promise<void> {
    throw new Error('ApiDraftStorageProvider.saveIndex is not wired yet.');
  }

  async get(_id: DraftId): Promise<Draft | null> {
    throw new Error('ApiDraftStorageProvider.get is not wired yet.');
  }

  async put(_draft: Draft): Promise<void> {
    throw new Error('ApiDraftStorageProvider.put is not wired yet.');
  }

  async remove(_id: DraftId): Promise<void> {
    throw new Error('ApiDraftStorageProvider.remove is not wired yet.');
  }

  async clear(): Promise<void> {
    throw new Error('ApiDraftStorageProvider.clear is not wired yet.');
  }

  async listIds(): Promise<DraftId[]> {
    throw new Error('ApiDraftStorageProvider.listIds is not wired yet.');
  }
}

export function createApiDraftStorage(config: ApiDraftStorageConfig): DraftStorageProvider {
  return new ApiDraftStorageProvider(config);
}
