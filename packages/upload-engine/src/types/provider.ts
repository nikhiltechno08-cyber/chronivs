import type { ProviderUploadContext, ProviderUploadResult } from '../types/upload';

/**
 * Storage provider contract.
 *
 * The Upload Engine delegates persistence to a provider implementation.
 * Swap {@link LocalUploadProvider} for {@link CloudinaryUploadProvider}
 * without changing frontend components — only the engine bootstrap changes.
 */
export interface UploadProvider {
  /** Human-readable provider name (e.g. `local`, `cloudinary`). */
  readonly name: string;

  /**
   * Persist a processed blob and return accessible URLs.
   */
  upload(context: ProviderUploadContext): Promise<ProviderUploadResult>;

  /**
   * Remove an asset from storage when the user deletes it.
   */
  delete(originalUrl: string, metadata?: Record<string, unknown>): Promise<void>;

  /**
   * Revoke ephemeral URLs (blob:) when no longer needed.
   */
  revokeUrl?(url: string): void;
}

/** Configuration for Cloudinary provider (future). */
export interface CloudinaryProviderConfig {
  readonly cloudName: string;
  readonly uploadPreset: string;
  readonly folder?: string;
  readonly resourceType?: 'auto' | 'image' | 'video' | 'raw';
}
