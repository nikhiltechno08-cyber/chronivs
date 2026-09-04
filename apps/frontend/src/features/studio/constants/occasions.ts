import type { OccasionConfig, OccasionKey, OccasionOption } from '../types';

export const MAX_PHOTOS = 5;

export const OCCASIONS: OccasionOption[] = [
  { key: 'birthday', emoji: '❤️', label: 'Birthday' },
  { key: 'proposal', emoji: '💍', label: 'Proposal' },
  { key: 'anniversary', emoji: '💕', label: 'Anniversary' },
  { key: 'mothers', emoji: '👩', label: "Mother's Day" },
  { key: 'fathers', emoji: '👨', label: "Father's Day" },
  { key: 'graduation', emoji: '🎓', label: 'Graduation' },
  { key: 'christmas', emoji: '🎄', label: 'Christmas' },
];

export const OCCASION_CONFIG: Record<OccasionKey, OccasionConfig> = {
  birthday: {
    relationships: [
      { key: 'girlfriend', label: 'Girlfriend' },
      { key: 'boyfriend', label: 'Boyfriend' },
      { key: 'mother', label: 'Mother' },
      { key: 'father', label: 'Father' },
      { key: 'brother', label: 'Brother' },
      { key: 'sister', label: 'Sister' },
      { key: 'friend', label: 'Friend' },
      { key: 'someone', label: 'Someone Special' },
    ],
    relHeadline: 'Who is this surprise for?',
    recipientLabel: 'Who are we celebrating?',
    dateLabel: 'When is their special day?',
    messageLabel: 'What would you love to tell them?',
    emoji: '🎂',
    summaryLabel: 'Birthday Experience',
  },
  proposal: {
    relationships: [
      { key: 'girlfriend', label: 'Girlfriend' },
      { key: 'boyfriend', label: 'Boyfriend' },
      { key: 'partner', label: 'Partner' },
    ],
    relHeadline: 'Who are you asking?',
    recipientLabel: "Who's the lucky one?",
    dateLabel: 'When will you ask?',
    messageLabel: 'What do you want them to know before you ask?',
    emoji: '💍',
    summaryLabel: 'Proposal Experience',
  },
  anniversary: {
    relationships: [
      { key: 'wife', label: 'Wife' },
      { key: 'husband', label: 'Husband' },
      { key: 'partner', label: 'Partner' },
      { key: 'someone', label: 'Someone Special' },
    ],
    relHeadline: 'Who are you celebrating with?',
    recipientLabel: "Who's your forever person?",
    dateLabel: "When's your anniversary?",
    messageLabel: 'What do you love most about them?',
    emoji: '💕',
    summaryLabel: 'Anniversary Experience',
  },
  mothers: {
    relationships: [
      { key: 'mother', label: 'Mother' },
      { key: 'grandmother', label: 'Grandmother' },
      { key: 'wife', label: 'Wife' },
      { key: 'someone', label: 'Someone Special' },
    ],
    relHeadline: 'Who is this for?',
    recipientLabel: 'Which incredible mother?',
    dateLabel: 'When would you like this ready by?',
    messageLabel: 'What would you love to thank her for?',
    emoji: '🌷',
    summaryLabel: "Mother's Day Experience",
  },
  fathers: {
    relationships: [
      { key: 'father', label: 'Father' },
      { key: 'grandfather', label: 'Grandfather' },
      { key: 'husband', label: 'Husband' },
      { key: 'someone', label: 'Someone Special' },
    ],
    relHeadline: 'Who is this for?',
    recipientLabel: 'Which incredible father?',
    dateLabel: 'When would you like this ready by?',
    messageLabel: 'What would you love to thank him for?',
    emoji: '🎩',
    summaryLabel: "Father's Day Experience",
  },
  graduation: {
    relationships: [
      { key: 'sister', label: 'Sister' },
      { key: 'brother', label: 'Brother' },
      { key: 'friend', label: 'Friend' },
      { key: 'child', label: 'Son / Daughter' },
      { key: 'someone', label: 'Someone Special' },
    ],
    relHeadline: "Who's graduating?",
    recipientLabel: 'Who earned this moment?',
    dateLabel: "When's the big day?",
    messageLabel: 'What are you proudest of?',
    emoji: '🎓',
    summaryLabel: 'Graduation Experience',
  },
  christmas: {
    relationships: [
      { key: 'family', label: 'Family' },
      { key: 'partner', label: 'Partner' },
      { key: 'friend', label: 'Friend' },
      { key: 'someone', label: 'Someone Special' },
    ],
    relHeadline: 'Who is this Christmas surprise for?',
    recipientLabel: 'Who deserves this Christmas magic?',
    dateLabel: 'Which day should it arrive?',
    messageLabel: "What's your Christmas wish for them?",
    emoji: '🎄',
    summaryLabel: 'Christmas Experience',
  },
};

export const LOADING_MESSAGES = [
  'Preparing your memories...',
  'Writing beautiful transitions...',
  'Adding cinematic animations...',
  'Tuning the lighting just right...',
  'Almost ready...',
] as const;
