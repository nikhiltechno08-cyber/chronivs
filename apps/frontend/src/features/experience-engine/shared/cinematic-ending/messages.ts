import type { ExperienceTemplateId } from '../../types';

/** Template-aware closing lines — layout stays identical; copy changes. */
export const ENDING_MESSAGES: Record<ExperienceTemplateId, readonly string[]> = {
  'birthday-girlfriend': ['Love is made of moments like these.'],
  'birthday-mother': ["A mother's love deserves to be celebrated forever."],
  'birthday-father': ['Some heroes never wear capes.'],
  'anniversary-wife': ['May your beautiful journey continue forever.'],
  'proposal-girlfriend': ["Every forever begins with one beautiful 'Yes'."],
};

export type EndingAmbientConfig = {
  hearts: boolean;
  petals: boolean;
  balloons: boolean;
  ribbons: boolean;
};

export function getEndingMessages(templateId: ExperienceTemplateId): readonly string[] {
  return ENDING_MESSAGES[templateId] ?? ['Some moments stay forever.'];
}

export function getEndingAmbientConfig(templateId: ExperienceTemplateId): EndingAmbientConfig {
  switch (templateId) {
    case 'birthday-girlfriend':
      return { hearts: true, petals: false, balloons: true, ribbons: true };
    case 'birthday-mother':
      return { hearts: false, petals: true, balloons: true, ribbons: true };
    case 'birthday-father':
      return { hearts: false, petals: true, balloons: true, ribbons: false };
    case 'anniversary-wife':
      return { hearts: true, petals: false, balloons: false, ribbons: true };
    case 'proposal-girlfriend':
      return { hearts: true, petals: true, balloons: false, ribbons: true };
    default:
      return { hearts: true, petals: false, balloons: false, ribbons: true };
  }
}
