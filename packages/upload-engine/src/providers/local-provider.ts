import { AssetKind } from '../enums/asset-kind';
import {
  LOCAL_UPLOAD_MS_PER_MB,
  LOCAL_UPLOAD_PROGRESS_INTERVAL_MS,
} from '../constants';
import type { UploadProvider } from '../types/provider';
import type { ProviderUploadContext, ProviderUploadResult } from '../types/upload';

export interface LocalUploadProviderOptions {
  /** Simulated upload speed multiplier (1 = default). */
  readonly speedMultiplier?: number;
}

/**
 * Local storage provider — persists assets as in-memory blob URLs.
 *
 * Used during architecture phase; swap for Cloudinary without UI changes.
 */
export class LocalUploadProvider implements UploadProvider {
  readonly name = 'local';

  private readonly speedMultiplier: number;
  private readonly managedUrls = new Set<string>();

  constructor(options: LocalUploadProviderOptions = {}) {
    this.speedMultiplier = options.speedMultiplier ?? 1;
  }

  async upload(context: ProviderUploadContext): Promise<ProviderUploadResult> {
    const originalUrl = URL.createObjectURL(context.blob);
    this.managedUrls.add(originalUrl);

    await this.simulateProgress(context);

    const previewUrl =
      context.kind === AssetKind.Image
        ? originalUrl
        : URL.createObjectURL(context.blob);

    if (previewUrl !== originalUrl) {
      this.managedUrls.add(previewUrl);
    }

    return {
      originalUrl,
      previewUrl,
      size: context.blob.size,
      metadata: { provider: this.name },
    };
  }

  async delete(originalUrl: string): Promise<void> {
    this.revokeUrl(originalUrl);
  }

  revokeUrl(url: string): void {
    if (this.managedUrls.has(url)) {
      URL.revokeObjectURL(url);
      this.managedUrls.delete(url);
    } else if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }

  /** Revoke all URLs managed by this provider instance. */
  dispose(): void {
    for (const url of this.managedUrls) {
      URL.revokeObjectURL(url);
    }
    this.managedUrls.clear();
  }

  private async simulateProgress(context: ProviderUploadContext): Promise<void> {
    const sizeMb = context.blob.size / (1024 * 1024);
    const totalMs = Math.max(
      200,
      (sizeMb * LOCAL_UPLOAD_MS_PER_MB) / this.speedMultiplier,
    );
    const steps = Math.ceil(totalMs / LOCAL_UPLOAD_PROGRESS_INTERVAL_MS);
    let step = 0;

    return new Promise((resolve) => {
      const tick = () => {
        step += 1;
        const progress = Math.min(100, Math.round((step / steps) * 100));
        context.onProgress?.(progress);

        if (step >= steps) {
          resolve();
        } else {
          setTimeout(tick, LOCAL_UPLOAD_PROGRESS_INTERVAL_MS);
        }
      };
      tick();
    });
  }
}
