import {
  createLocalDraftManager,
  type DraftManager,
  type Draft,
  type DraftPatch,
} from '@chronivs/draft-engine';

import type { DraftPort } from '../../types/ports';

export class DefaultDraftAdapter implements DraftPort {
  readonly name = 'draft-engine';

  private readonly manager: DraftManager<Record<string, unknown>>;

  constructor(manager?: DraftManager<Record<string, unknown>>) {
    this.manager = manager ?? createLocalDraftManager();
  }

  getManager(): DraftManager<Record<string, unknown>> {
    return this.manager;
  }

  async initialize(): Promise<Draft | null> {
    return this.manager.initialize();
  }

  async createDraft(
    payload: Record<string, unknown>,
    metadata?: Draft['metadata'],
  ): Promise<Draft> {
    return this.manager.createDraft({ payload, metadata });
  }

  async loadDraft(id: Draft['id']): Promise<Draft | null> {
    return this.manager.loadDraft(id);
  }

  async saveDraft(draft?: Draft): Promise<Draft> {
    return this.manager.saveDraft(draft as Draft<Record<string, unknown>>);
  }

  async updateDraft(patch: DraftPatch<Record<string, unknown>>): Promise<Draft> {
    return this.manager.updateDraft(patch);
  }

  getActiveDraft(): Draft | null {
    return this.manager.getActiveDraft();
  }

  subscribe(listener: (draft: Draft | null) => void): () => void {
    return this.manager.subscribe((draft) => listener(draft));
  }
}

export function createDraftPort(
  manager?: DraftManager<Record<string, unknown>>,
): DefaultDraftAdapter {
  return new DefaultDraftAdapter(manager);
}
