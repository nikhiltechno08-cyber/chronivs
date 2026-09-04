import {
  createLocalUploadEngine,
  type UploadEngine,
  type UploadCollection,
  type UploadFileOptions,
  type UploadResult,
} from '@chronivs/upload-engine';

import type { UploadPort } from '../../types/ports';

export class DefaultUploadAdapter implements UploadPort {
  readonly name = 'upload-engine';

  private readonly engine: UploadEngine;

  constructor(engine?: UploadEngine) {
    this.engine = engine ?? createLocalUploadEngine();
  }

  getEngine(): UploadEngine {
    return this.engine;
  }

  getCollection(): UploadCollection {
    return this.engine.getCollection();
  }

  async upload(
    file: File,
    options?: Omit<UploadFileOptions, 'file'>,
  ): Promise<UploadResult> {
    return this.engine.upload({ file, ...options });
  }

  remove(assetId: string): UploadCollection {
    return this.engine.remove(assetId);
  }

  reorder(fromIndex: number, toIndex: number): UploadCollection {
    return this.engine.reorder(fromIndex, toIndex);
  }

  subscribe(listener: (collection: UploadCollection) => void): () => void {
    return this.engine.subscribe((collection) => listener(collection));
  }
}

export function createUploadPort(engine?: UploadEngine): DefaultUploadAdapter {
  return new DefaultUploadAdapter(engine);
}
