import type { ExperienceRendererProps } from '../renderers';
import type { ExperienceInputData } from '../types';

export type AnniversaryWifeProps = ExperienceRendererProps;

export type SceneComponentProps = {
  data: ExperienceInputData;
  onNext: () => void;
  isActive: boolean;
};

export type PhotoSlotIndex = 0 | 1 | 2 | 3 | 4;

export type ParticleType = 'petal' | 'dust' | 'bokeh' | 'sparkle' | 'star' | 'firefly';
