import type { ExperienceRendererProps } from '../renderers';
import type { ExperienceInputData } from '../types';

export type BirthdayFatherProps = ExperienceRendererProps;

export type SceneComponentProps = {
  data: ExperienceInputData;
  onNext: () => void;
  isActive: boolean;
};

export type PhotoSlotIndex = 0 | 1 | 2 | 3 | 4;
