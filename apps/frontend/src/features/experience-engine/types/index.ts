import type { OccasionKey, RelationshipKey } from '@/features/studio/types';

/** Re-export studio types used by the engine */
export type { OccasionKey, RelationshipKey };

export type ExperienceTemplateId =
  | 'birthday-girlfriend'
  | 'birthday-mother'
  | 'birthday-father'
  | 'anniversary-wife'
  | 'proposal-girlfriend';

export type ExperienceEngineStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'complete'
  | 'error';

export type ExperienceInputData = {
  receiverName: string;
  senderName: string;
  specialDate?: string;
  customMessage: string;
  /** Resolved photo URLs (user uploads or fallbacks) */
  photos: string[];
  audioUrl?: string;
};

export type SceneId =
  | 'surprise'
  | 'birthday'
  | 'beginning'
  | 'memories'
  | 'love'
  | 'heart'
  | 'celebration'
  | 'forever'
  /* Mother Birthday */
  | 'welcome'
  | 'memory-garden'
  | 'moments'
  | 'heart-letter'
  | 'voice'
  | 'thank-you'
  | 'ending'
  /* Father Birthday — 12 chapters matching HTML template */
  | 'father-welcome'
  | 'father-door'
  | 'father-timeline'
  | 'father-hands'
  | 'father-album'
  | 'father-lanterns'
  | 'father-voice'
  | 'father-letter'
  | 'father-celebration'
  | 'father-wishes'
  | 'father-thank-you'
  | 'father-ending'
  /* Anniversary Wife — 12 scenes matching HTML template */
  | 'wife-welcome'
  | 'wife-photo'
  | 'wife-ribbon'
  | 'wife-stars'
  | 'wife-puzzle'
  | 'wife-frames'
  | 'wife-letter'
  | 'wife-vinyl'
  | 'wife-promises'
  | 'wife-tree'
  | 'wife-celebration'
  | 'wife-ending'
  /* Proposal Girlfriend — 10 scenes matching HTML template */
  | 'prop-lantern'
  | 'prop-photo'
  | 'prop-little-things'
  | 'prop-cards'
  | 'prop-timeline'
  | 'prop-orbs'
  | 'prop-seal'
  | 'prop-one-more-secret'
  | 'prop-letter'
  | 'prop-before-question'
  | 'prop-one-last-surprise'
  | 'prop-proposal'
  | 'prop-celebration'
  | 'prop-hope';

export type SceneDefinition = {
  id: SceneId;
  index: number;
  worldPhase: number;
};

export type TemplateDefinition = {
  id: ExperienceTemplateId;
  label: string;
  occasion: OccasionKey;
  relationships: RelationshipKey[];
};

export type TemplateConfig = {
  templateId?: ExperienceTemplateId;
  resolvedAt?: string;
};

export type GeneratedExperience = {
  id: string;
  status: 'pending' | 'generating' | 'ready';
  templateId?: ExperienceTemplateId;
  previewTitle?: string;
  previewEmoji?: string;
  shareUrl?: string;
};
