import {
  createPreviewEngine,
  type PreviewEngine,
  type PreviewDraftPayload,
  type PreviewState,
  type PreviewSyncResult,
} from '@chronivs/preview-engine';

import type { DraftPort, PreviewPort } from '../../types/ports';

export class DefaultPreviewAdapter implements PreviewPort {
  readonly name = 'preview-engine';

  private readonly engine: PreviewEngine;

  constructor(engine?: PreviewEngine) {
    this.engine = engine ?? createPreviewEngine();
  }

  getEngine(): PreviewEngine {
    return this.engine;
  }

  bindDraft(manager: {
    subscribe: DraftPort['subscribe'];
    getActiveDraft: DraftPort['getActiveDraft'];
  }): () => void {
    return this.engine.bindDraftManager({
      subscribe: manager.subscribe,
      getActiveDraft: manager.getActiveDraft,
    });
  }

  async sync(payload: PreviewDraftPayload): Promise<PreviewSyncResult> {
    return this.engine.sync(payload);
  }

  scheduleUpdate(payload: PreviewDraftPayload): void {
    this.engine.scheduleUpdate(payload);
  }

  getState(): PreviewState {
    return this.engine.getState();
  }

  subscribe(listener: (state: PreviewState) => void): () => void {
    return this.engine.subscribe(listener);
  }
}

export function createPreviewPort(engine?: PreviewEngine): DefaultPreviewAdapter {
  return new DefaultPreviewAdapter(engine);
}
