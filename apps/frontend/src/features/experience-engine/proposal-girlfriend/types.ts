import type { ExperienceRendererProps } from '../renderers';
import type { ExperienceInputData } from '../types';

export type ProposalGirlfriendProps = ExperienceRendererProps;

export type SceneComponentProps = {
  data: ExperienceInputData;
  onNext: () => void;
  isActive: boolean;
};

export type ProposalConfig = {
  reasons: { mark: string; text: string }[];
  milestones: { label: string; title: string; quote: string }[];
  wonderWords: string[];
  letterParagraphs: string[];
  proposalQuestion: string;
  signature: string;
  dateText: string;
  celebrationLines: string[];
};
