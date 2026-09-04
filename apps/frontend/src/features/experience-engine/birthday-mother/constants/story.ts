import { buildActiveScenes } from '../../core/scene-availability';
import type { SceneId } from '../../types';

export const SCENE_ORDER: SceneId[] = [
  'welcome',
  'memory-garden',
  'moments',
  'heart-letter',
  'voice',
  'thank-you',
  'ending',
];

export const SCENE_COUNT = SCENE_ORDER.length;

/** Scene indexes that still play once disabled scenes are filtered out. */
export const ACTIVE_SCENES = buildActiveScenes(SCENE_ORDER);

export function getWorldPhase(sceneIndex: number): number {
  return sceneIndex + 1;
}

/** Warm premium placeholders when photos are missing */
export const MOTHER_PHOTO_GRADIENTS = [
  'linear-gradient(150deg, #f0c98a, #e7b593 60%, #d9ad63)',
  'linear-gradient(150deg, #e9cc9c, #e0996b 60%, #caa06e)',
  'linear-gradient(150deg, #f3d9ac, #eec488 60%, #d9a463)',
  'linear-gradient(150deg, #e8c7a0, #dba471 60%, #b96e4a)',
  'linear-gradient(150deg, #f3e6cf, #e9cc9c 60%, #caa06e)',
] as const;

export const GARDEN_QUOTES = [
  'Your hug was my first safe place.',
  'You made ordinary days feel golden.',
  'I learned kindness by watching you.',
  'Every prayer you whispered became my wings.',
  'Home was never a house — it was you.',
] as const;

export const FLOWER_POSITIONS = [
  { top: '8%', left: '10%' },
  { top: '28%', left: '34%' },
  { top: '6%', left: '58%' },
  { top: '32%', left: '78%' },
  { top: '2%', left: '44%' },
] as const;

export const MOMENT_CAPTIONS = [
  'A soft morning with you',
  'Laughter we still keep',
  'The quiet strength of your love',
  'Hands that always held me',
  'Years of warmth, one heartbeat',
] as const;

export const MOMENT_POSITIONS = [
  { top: '8%', left: '6%', rotate: -8 },
  { top: '18%', left: '58%', rotate: 6 },
  { top: '48%', left: '12%', rotate: 4 },
  { top: '42%', left: '62%', rotate: -5 },
  { top: '28%', left: '36%', rotate: 2 },
] as const;

export const THANK_YOU_LINES = [
  'You spent your life building mine.',
  "Now it's my turn to stand beside you.",
  "Thank you, Maa — for everything I am.",
] as const;

export const DEFAULT_LETTER_LINES = [
  'Dear Maa,',
  'Before the world knew my name, you already loved me.',
  'You turned my fears into courage,',
  'my ordinary days into warmth,',
  'and every goodbye into a promise.',
  'Happy Birthday.',
  'I am forever your child.',
] as const;

export function buildMotherLetterLines(customMessage: string): string[] {
  const trimmed = customMessage.trim();
  if (!trimmed) return [...DEFAULT_LETTER_LINES];

  const pieces = trimmed
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (pieces.length === 0) return [...DEFAULT_LETTER_LINES];

  return ['Dear Maa,', ...pieces.slice(0, 6)];
}

export function resolveMotherPhotos(photos: string[]): string[] {
  return Array.from({ length: 5 }, (_, i) => photos[i] ?? '');
}
