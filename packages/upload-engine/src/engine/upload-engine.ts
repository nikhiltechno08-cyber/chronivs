import { DEFAULT_MAX_ASSETS } from '../constants';
import { AssetKind } from '../enums/asset-kind';
import { UploadStatus } from '../enums/upload-status';
import { removeMedia, reorderMedia, retryUpload } from '../operations';
import { runCompressionPipeline } from '../pipeline/compression';
import { generatePreview } from '../pipeline/generate-preview';
import type { UploadCollection, UploadedAsset } from '../types/asset';
import type { UploadProvider } from '../types/provider';
import type {
  UploadEngineConfig,
  UploadEngineListener,
  UploadFileOptions,
  UploadResult,
} from '../types/upload';
import { getActiveAssets, patchAsset } from '../utils/collection';
import { generateUploadAssetId, nowTimestamp } from '../utils/id';
import { LocalUploadProvider } from '../providers/local-provider';
import { validateFile } from '../validation/validate-file';

/**
 * Upload Engine — orchestrates validation, compression, preview, and storage.
 *
 * Frontend components consume {@link UploadEngine.getCollection} and
 * subscribe via {@link UploadEngine.subscribe}. The storage backend is
 * injected through {@link UploadProvider} (local today, Cloudinary later).
 */
export class UploadEngine {
  private collection: UploadCollection = [];
  private readonly listeners = new Set<UploadEngineListener>();
  private readonly provider: UploadProvider;
  private readonly config: UploadEngineConfig;

  constructor(provider: UploadProvider, config: UploadEngineConfig = {}) {
    this.provider = provider;
    this.config = config;
  }

  /** Current asset collection (immutable snapshot). */
  getCollection(): UploadCollection {
    return this.collection;
  }

  /** Active (non-removed) assets sorted by order. */
  getActiveCollection(): UploadedAsset[] {
    return getActiveAssets(this.collection);
  }

  /** Subscribe to collection changes. Returns unsubscribe function. */
  subscribe(listener: UploadEngineListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Upload a single file through the full pipeline. */
  async upload(options: UploadFileOptions): Promise<UploadResult> {
    const activeCount = getActiveAssets(this.collection).length;
    const validation = validateFile(options.file, {
      ...this.config.validation,
      maxAssets: this.config.maxAssets ?? DEFAULT_MAX_ASSETS,
      currentAssetCount: activeCount,
    });

    if (!validation.valid || !validation.kind) {
      const failedAsset = this.createDraft({
        file: options.file,
        kind: validation.kind ?? AssetKind.Image,
        mimeType: validation.mimeType,
        order: activeCount,
        status: UploadStatus.Failed,
        error: validation.errors.join(' '),
      });

      this.commit([...this.collection, failedAsset]);
      return { asset: failedAsset, success: false };
    }

    const asset = this.createDraft({
      file: options.file,
      kind: validation.kind,
      mimeType: validation.mimeType,
      order: options.order ?? activeCount,
      metadata: options.metadata,
    });

    this.commit([...this.collection, asset]);
    options.onProgress?.(0, asset);

    try {
      const uploading = patchAsset(asset, { status: UploadStatus.Uploading, progress: 5 });
      this.updateAsset(uploading);
      options.onProgress?.(5, uploading);

      const compression = await runCompressionPipeline(
        {
          file: options.file,
          kind: validation.kind,
          mimeType: validation.mimeType,
        },
        { skipCompression: options.skipCompression },
      );

      let current = patchAsset(uploading, { progress: 25 });
      this.updateAsset(current);
      options.onProgress?.(25, current);

      const preview = await generatePreview({
        blob: compression.blob,
        mimeType: compression.mimeType,
        kind: validation.kind,
        filename: options.file.name,
      });

      current = patchAsset(current, {
        progress: 40,
        previewUrl: preview.previewUrl,
        metadata: { ...current.metadata, ...compression.metadata, ...preview.metadata },
      });
      this.updateAsset(current);
      options.onProgress?.(40, current);

      const providerResult = await this.provider.upload({
        assetId: asset.id,
        filename: options.file.name,
        mimeType: compression.mimeType,
        kind: validation.kind,
        blob: compression.blob,
        onProgress: (p) => {
          const mapped = 40 + Math.round(p * 0.6);
          current = patchAsset(current, { progress: mapped });
          this.updateAsset(current);
          options.onProgress?.(mapped, current);
        },
      });

      const uploaded = patchAsset(current, {
        status: UploadStatus.Uploaded,
        progress: 100,
        originalUrl: providerResult.originalUrl,
        previewUrl: providerResult.previewUrl ?? preview.previewUrl,
        size: providerResult.size,
        metadata: {
          ...current.metadata,
          ...providerResult.metadata,
          provider: this.provider.name,
        },
      });

      this.updateAsset(uploaded);
      options.onProgress?.(100, uploaded);
      return { asset: uploaded, success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      const failed = patchAsset(
        this.collection.find((a) => a.id === asset.id) ?? asset,
        { status: UploadStatus.Failed, error: message },
      );
      this.updateAsset(failed);
      options.onProgress?.(failed.progress, failed);
      return { asset: failed, success: false };
    }
  }

  /** Remove an asset by id. */
  remove(assetId: string): UploadCollection {
    const target = this.collection.find((a) => a.id === assetId);
    if (target?.originalUrl) {
      void this.provider.delete(target.originalUrl, target.metadata);
      this.provider.revokeUrl?.(target.originalUrl);
    }
    if (target?.previewUrl && target.previewUrl !== target.originalUrl) {
      this.provider.revokeUrl?.(target.previewUrl);
    }

    this.collection = removeMedia({
      collection: this.collection,
      assetId: assetId as UploadedAsset['id'],
    });
    this.notify();
    return this.collection;
  }

  /** Reorder active assets. */
  reorder(fromIndex: number, toIndex: number): UploadCollection {
    this.collection = reorderMedia({
      collection: this.collection,
      fromIndex,
      toIndex,
    });
    this.notify();
    return this.collection;
  }

  /** Retry a failed upload with a fresh file. */
  async retry(assetId: string, file: File, onProgress?: UploadFileOptions['onProgress']): Promise<UploadResult> {
    const existing = this.collection.find((a) => a.id === assetId);
    if (!existing) {
      throw new Error(`Asset ${assetId} not found`);
    }

    const result = await retryUpload(this.provider, {
      asset: existing,
      file,
      onProgress,
    });

    this.updateAsset(result.asset);
    return { asset: result.asset, success: result.success };
  }

  /** Replace entire collection (e.g. hydration from draft). */
  hydrate(collection: UploadCollection): void {
    this.collection = collection.slice();
    this.notify();
  }

  /** Clean up provider resources. */
  dispose(): void {
    if ('dispose' in this.provider && typeof this.provider.dispose === 'function') {
      (this.provider as { dispose: () => void }).dispose();
    }
    this.listeners.clear();
  }

  private createDraft(input: {
    file: File;
    kind: UploadedAsset['kind'];
    mimeType: string;
    order: number;
    status?: UploadStatus;
    error?: string;
    metadata?: UploadedAsset['metadata'];
  }): UploadedAsset {
    return {
      id: generateUploadAssetId(),
      filename: input.file.name,
      mimeType: input.mimeType,
      size: input.file.size,
      previewUrl: null,
      originalUrl: null,
      status: input.status ?? UploadStatus.Idle,
      progress: 0,
      createdAt: nowTimestamp(),
      metadata: input.metadata ?? {},
      kind: input.kind,
      order: input.order,
      error: input.error,
      retryCount: 0,
    };
  }

  private updateAsset(asset: UploadedAsset): void {
    this.collection = this.collection.map((a) => (a.id === asset.id ? asset : a));
    this.notify();
  }

  private commit(collection: UploadCollection): void {
    this.collection = collection;
    this.notify();
  }

  private notify(): void {
    const snapshot = this.getCollection();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }
}

/** Create an engine with the local blob provider (default for architecture phase). */
export function createLocalUploadEngine(config?: UploadEngineConfig): UploadEngine {
  return new UploadEngine(new LocalUploadProvider(), config);
}
