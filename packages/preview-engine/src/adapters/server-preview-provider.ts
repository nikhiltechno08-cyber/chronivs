import type { RenderedExperience } from '@chronivs/experience-renderer';

import type { ServerPreviewProvider } from '../types';

/**
 * Server-side preview provider — architecture stub.
 *
 * Future: POST experience JSON to render service, return scene plan.
 * Frontend adapter swaps local renderer for this without UI changes.
 */
export class LocalServerPreviewProvider implements ServerPreviewProvider {
  readonly name = 'local-renderer';

  async renderPreview(_experienceJson: string): Promise<RenderedExperience> {
    throw new Error(
      'LocalServerPreviewProvider is not wired yet. ' +
        'Use client-side PreviewEngine during architecture phase.',
    );
  }
}

export function createServerPreviewProvider(): ServerPreviewProvider {
  return new LocalServerPreviewProvider();
}
