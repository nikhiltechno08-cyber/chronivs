import type { Experience } from '@chronivs/experience-core';
import { renderExperience, type RenderedExperience } from '@chronivs/experience-renderer';

import type { RendererPort } from '../../types/ports';

export class DefaultRendererAdapter implements RendererPort {
  readonly name = 'experience-renderer';

  render(experience: Experience): RenderedExperience {
    return renderExperience(experience);
  }
}

export function createRendererPort(): RendererPort {
  return new DefaultRendererAdapter();
}
