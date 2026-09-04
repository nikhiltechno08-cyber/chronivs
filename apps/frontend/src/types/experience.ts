/**
 * Canonical Chronivs ExperienceData — single source of truth.
 * Every template / checkout / preview path should flow through this object.
 */

export type ExperienceTheme = {
  id: string;
};

export type ExperienceRecipient = {
  name: string;
  nickname: string;
};

export type ExperienceCreator = {
  name: string;
  email: string;
  phone: string;
};

export type ExperienceTimelineItem = {
  id: string;
  title: string;
  body: string;
  dateLabel?: string;
  mediaId?: string;
  order: number;
};

export type ExperienceContent = {
  title: string;
  subtitle: string;
  letter: string;
  proposal: string;
  timeline: ExperienceTimelineItem[];
  reasons: string[];
  specialDate: string;
};

export type ExperienceMediaAsset = {
  id: string;
  mediaId?: string;
  publicId?: string;
  url: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  caption?: string;
  order: number;
};

export type ExperienceMusic = {
  mediaId?: string;
  url?: string;
  title?: string;
  enabled: boolean;
};

export type ExperienceMedia = {
  coverPhoto: ExperienceMediaAsset | null;
  gallery: ExperienceMediaAsset[];
  music: ExperienceMusic;
};

export type ExperienceSettings = {
  language: string;
  musicEnabled: boolean;
  showConfetti: boolean;
};

export type ExperienceMetadata = {
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type ExperienceData = {
  experienceId: string;
  occasion: string;
  relationship: string;
  templateId: string;
  theme: ExperienceTheme;
  recipient: ExperienceRecipient;
  creator: ExperienceCreator;
  content: ExperienceContent;
  media: ExperienceMedia;
  settings: ExperienceSettings;
  metadata: ExperienceMetadata;
};

/** Structured validation error for checkout / publish gates. */
export type ExperienceValidationIssue = {
  path: string;
  code: string;
  message: string;
};

export type ExperienceValidationResult = {
  valid: boolean;
  errors: ExperienceValidationIssue[];
};
