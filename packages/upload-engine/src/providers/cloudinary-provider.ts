import type { CloudinaryProviderConfig, UploadProvider } from '../types/provider';
import type { ProviderUploadContext, ProviderUploadResult } from '../types/upload';

/**
 * Cloudinary upload provider — architecture stub.
 *
 * Implements {@link UploadProvider} so the engine can be wired to Cloudinary
 * by replacing the provider at bootstrap time. No network calls in this phase.
 *
 * @see packages/upload-engine/README.md — Cloudinary Integration
 */
export class CloudinaryUploadProvider implements UploadProvider {
  readonly name = 'cloudinary';

  constructor(private readonly _config: CloudinaryProviderConfig) {
    // Config retained for future wiring; intentionally unused in architecture phase.
    void this._config;
  }

  async upload(_context: ProviderUploadContext): Promise<ProviderUploadResult> {
    throw new Error(
      'CloudinaryUploadProvider is not wired yet. ' +
        'Use LocalUploadProvider during architecture phase. ' +
        'See @chronivs/upload-engine README for integration steps.',
    );
  }

  async delete(_originalUrl: string): Promise<void> {
    throw new Error(
      'CloudinaryUploadProvider.delete is not wired yet.',
    );
  }
}

/** Factory for future Cloudinary bootstrap. */
export function createCloudinaryProvider(
  config: CloudinaryProviderConfig,
): UploadProvider {
  return new CloudinaryUploadProvider(config);
}
