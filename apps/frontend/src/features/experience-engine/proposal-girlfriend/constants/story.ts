import type { SceneId } from '../../types';
import type { ExperienceInputData } from '../../types';
import type { ProposalConfig } from '../types';

export const SCENE_ORDER: SceneId[] = [
  'prop-lantern',
  'prop-photo',
  'prop-little-things',
  'prop-cards',
  'prop-timeline',
  'prop-orbs',
  'prop-seal',
  'prop-one-more-secret',
  'prop-letter',
  'prop-before-question',
  'prop-one-last-surprise',
  'prop-proposal',
  'prop-celebration',
  'prop-hope',
];

export const SCENE_COUNT = SCENE_ORDER.length;

export const DEFAULT_CONFIG: ProposalConfig = {
  reasons: [
    { mark: 'I', text: 'I love your smile — it still catches me off guard.' },
    { mark: 'II', text: 'I love your kindness, the way you show up for people.' },
    { mark: 'III', text: 'I love your strength on the days you think no one\'s watching.' },
    { mark: 'IV', text: 'I love your heart — the biggest, softest thing I know.' },
    { mark: 'V', text: 'I love your dreams, and getting to be part of them.' },
  ],
  milestones: [
    { label: 'First Meeting', title: 'Where It Began', quote: '"I didn\'t know that day would change everything."' },
    { label: 'First Coffee', title: 'Two Cups, No Rush', quote: '"We talked until the shop closed around us."' },
    { label: 'First Trip', title: 'Somewhere New, Together', quote: '"Every place feels different with you in it."' },
    { label: 'First Hug', title: 'Home, Found Early', quote: '"I remember exactly how that felt."' },
    { label: 'Today', title: 'Right Here', quote: '"Still choosing you. Still sure."' },
  ],
  wonderWords: ['Every', 'day', 'with', 'you', 'still', 'feels', 'like', 'magic.'],
  letterParagraphs: [
    'There\'s a version of my life without you in it, and I don\'t like it very much.',
    'You made ordinary Tuesdays feel like something worth remembering. You made a house feel like a home before I even noticed it happening.',
    'I\'ve thought about how to say this a hundred different ways, and none of them feel big enough. So I\'ll just say it simply.',
  ],
  proposalQuestion: 'Will you marry me?',
  signature: '— always yours',
  dateText: '17 July 2026',
  celebrationLines: ['You said yes.', 'Best answer I\'ve ever heard.', 'Forever starts today.'],
};

export function resolveProposalConfig(data: ExperienceInputData): ProposalConfig {
  const paragraphs =
    data.customMessage?.trim()
      ? data.customMessage
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean)
      : DEFAULT_CONFIG.letterParagraphs;

  return {
    ...DEFAULT_CONFIG,
    letterParagraphs: paragraphs.length > 0 ? paragraphs : DEFAULT_CONFIG.letterParagraphs,
    signature: data.senderName?.trim() ? `— ${data.senderName.trim()}` : DEFAULT_CONFIG.signature,
    dateText: data.specialDate?.trim() || DEFAULT_CONFIG.dateText,
  };
}

export function resolveHerName(data: ExperienceInputData): string {
  return data.receiverName?.trim() || 'Her Name';
}

export function resolveSenderName(data: ExperienceInputData): string {
  return data.senderName?.trim() || 'Your Name';
}

export function resolvePhotoUrl(data: ExperienceInputData): string | undefined {
  return data.photos?.[0]?.trim() || undefined;
}

export const LITTLE_THINGS_LINES = [
  "Maybe it wasn't the big moments...",
  'Maybe it was the little ones.',
  'The random laughs.',
  'The unexpected smiles.',
  'The quiet moments that somehow became unforgettable.',
] as const;

export const LITTLE_THINGS_CAPTIONS = [
  'That laugh over nothing.',
  'Coffee, side by side.',
  'A quiet smile I still remember.',
] as const;

export const LITTLE_THINGS_PLACEHOLDERS = [
  {
    emoji: '☕',
    gradient: 'radial-gradient(circle at 35% 30%, #4a3548, #1a101c 75%)',
  },
  {
    emoji: '🌙',
    gradient: 'radial-gradient(circle at 35% 30%, #3a3244, #14101c 75%)',
  },
  {
    emoji: '✨',
    gradient: 'radial-gradient(circle at 35% 30%, #5a2a38, #0a0812 75%)',
  },
] as const;

export function resolveLittleThingsPhotos(data: ExperienceInputData): (string | undefined)[] {
  return [1, 2, 3].map((i) => data.photos?.[i]?.trim() || undefined);
}

export const ONE_MORE_SECRET_LINES = [
  "I've been carrying these words in my heart...",
  'Would you like to read them?',
] as const;

export const ONE_LAST_SURPRISE_LINES = [
  'There is one more thing...',
  "Something I've dreamed about...",
  "For longer than you'll ever know.",
] as const;

export const BEFORE_QUESTION_LINES = [
  "I've imagined this moment...",
  'More times than I can count.',
  'I rewrote these words...',
  'Again...',
  'And again.',
  'But no sentence could ever explain...',
  '...how much you truly mean to me.',
] as const;
