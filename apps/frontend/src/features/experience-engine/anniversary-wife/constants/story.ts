import { buildActiveScenes } from '../../core/scene-availability';
import type { SceneId } from '../../types';
import type { ParticleType } from '../types';

export const SCENE_ORDER: SceneId[] = [
  'wife-welcome',
  'wife-photo',
  'wife-ribbon',
  'wife-stars',
  'wife-puzzle',
  'wife-frames',
  'wife-letter',
  'wife-vinyl',
  'wife-promises',
  'wife-tree',
  'wife-celebration',
  'wife-ending',
];

export const SCENE_COUNT = SCENE_ORDER.length;

/** Scene indexes that still play once disabled scenes are filtered out. */
export const ACTIVE_SCENES = buildActiveScenes(SCENE_ORDER);

export function getWorldPhase(sceneIndex: number): number {
  return sceneIndex;
}

export const THEMES = [
  'radial-gradient(120% 90% at 50% 10%, #fbe9de 0%, #f0cdb3 45%, #d99a8a 80%, #7B2D3E 130%)',
  'linear-gradient(180deg,#f3e2d6 0%,#dcae9c 60%,#7B2D3E 130%)',
  'radial-gradient(120% 90% at 50% 20%, #fbeee1 0%, #eccbb0 55%, #c98a7a 100%)',
  'radial-gradient(120% 110% at 50% 100%, #1a0f16 0%, #2e1720 45%, #4a1f2a 100%)',
  'radial-gradient(100% 80% at 50% 30%, #f6e6d8 0%, #e3bfa8 55%, #a9705a 100%)',
  'linear-gradient(160deg,#f7e9de 0%,#e6c4ac 100%)',
  'radial-gradient(100% 80% at 50% 30%, #f7ece2 0%, #e6c9b7 55%, #b98070 100%)',
  'radial-gradient(100% 80% at 50% 40%, #f2e2d4 0%, #d9ac96 60%, #8a4a3a 100%)',
  'linear-gradient(160deg,#f6e6da 0%,#e0b39c 100%)',
  'radial-gradient(120% 110% at 50% 100%, #0f1a12 0%, #1c2e20 45%, #2a4a30 100%)',
  'radial-gradient(120% 100% at 50% 0%, #fbeee0 0%, #f0cdae 45%, #d98a7a 100%)',
  'radial-gradient(120% 90% at 50% 0%, #fdf3e8 0%, #f0d3ba 45%, #c88a78 100%)',
] as const;

export const SCENE_PARTICLES: ParticleType[] = [
  'petal',
  'dust',
  'petal',
  'star',
  'dust',
  'petal',
  'petal',
  'dust',
  'sparkle',
  'firefly',
  'petal',
  'bokeh',
];

export const PARTICLE_COLORS: Record<ParticleType, string> = {
  petal: '217,167,156',
  dust: '243,201,139',
  bokeh: '255,235,210',
  sparkle: '255,244,214',
  star: '255,255,255',
  firefly: '250,220,120',
};

export const PARTICLE_COUNTS: Record<ParticleType, number> = {
  petal: 16,
  dust: 34,
  bokeh: 10,
  sparkle: 26,
  star: 70,
  firefly: 24,
};

export const ART_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23F0B79C'/%3E%3Cstop offset='1' stop-color='%237B2D3E'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='300' height='300' fill='url(%23g)'/%3E%3Ccircle cx='120' cy='130' r='42' fill='%23fff2e6' opacity='0.85'/%3E%3Ccircle cx='180' cy='130' r='42' fill='%23fff2e6' opacity='0.85'/%3E%3Cpath d='M150,190 L110,150 A28,28 0 0 1 150,120 A28,28 0 0 1 190,150 Z' fill='%23E8C39E'/%3E%3C/svg%3E`;

export const WIFE_PHOTO_GRADIENTS = [
  'linear-gradient(160deg, #caa79c, #7B2D3E)',
  'linear-gradient(160deg, var(--aw-cream), var(--aw-rosegold))',
  'linear-gradient(160deg, var(--aw-cream), var(--aw-rosegold))',
  'linear-gradient(160deg, var(--aw-cream), var(--aw-rosegold))',
  'linear-gradient(160deg, var(--aw-cream), var(--aw-rosegold))',
] as const;

export const RIBBON_STOPS = [
  { icon: '👀', label: 'First Meeting', quote: 'I remember exactly where you were standing.' },
  { icon: '🍷', label: 'First Date', quote: 'I talked too much. You laughed anyway.' },
  { icon: '✈️', label: 'First Trip', quote: 'Getting lost together, on purpose.' },
  { icon: '💍', label: 'Wedding', quote: 'The best decision I ever made, easily.' },
  { icon: '🏡', label: 'Today', quote: 'Still choosing you, every single morning.' },
] as const;

export const STAR_WISHES = [
  { icon: '🌅', quote: 'The sunrise the morning after our wedding.' },
  { icon: '🎂', quote: 'Your face lighting up at your surprise party.' },
  { icon: '🌧️', quote: 'Dancing in the kitchen during that thunderstorm.' },
  { icon: '🚗', quote: 'That long drive where we said nothing and it was perfect.' },
  { icon: '🕯️', quote: 'Every quiet dinner that felt like enough.' },
] as const;

export const STAR_POSITIONS = [
  [15, 28],
  [70, 18],
  [42, 58],
  [84, 50],
  [24, 70],
] as const;

export const MEMORY_FRAMES = [
  { icon: '🍝', caption: 'That tiny restaurant we still talk about.' },
  { icon: '🏖️', caption: 'The beach trip where nothing went to plan.' },
  { icon: '🎉', caption: 'Your birthday, three years ago.' },
  { icon: '🐶', caption: 'The day we brought them home.' },
  { icon: '🌙', caption: 'A random Tuesday that somehow felt magic.' },
] as const;

export const FRAME_POSITIONS = [
  [6, 15, -6],
  [26, 45, 8],
  [48, 10, -10],
  [68, 42, 6],
  [84, 18, -4],
] as const;

export const PROMISES = [
  "I'll keep choosing you.",
  "I'll keep making you laugh.",
  "I'll keep holding your hand.",
  "I'll keep believing in us.",
  "I'll keep loving you.",
] as const;

export const TREE_LEAVES = [
  { x: 38, y: 30, quote: 'The night we adopted our routines — coffee, silence, us.' },
  { x: 55, y: 22, quote: 'Every argument that ended in laughter within the hour.' },
  { x: 45, y: 45, quote: 'The trip we almost cancelled and never regretted taking.' },
  { x: 62, y: 40, quote: 'How you still hold my hand in the car.' },
  { x: 35, y: 55, quote: 'All the ordinary Tuesdays that were secretly extraordinary.' },
] as const;

export const DEFAULT_LETTER_LINES = [
  "I don't say this enough, so let me say it slowly.",
  'Thank you for choosing this life with me, again and again, on the easy days and the hard ones.',
  'You are still, after everything, my favorite person to come home to.',
  'Always yours.',
] as const;

export function buildWifeLetterLines(customMessage: string, herName: string): string[] {
  const name = herName.trim() || 'my love';
  const greeting = `My ${name},`;
  const trimmed = customMessage.trim();

  if (!trimmed) {
    return [greeting, ...DEFAULT_LETTER_LINES];
  }

  const pieces = trimmed
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (pieces.length === 0) {
    return [greeting, ...DEFAULT_LETTER_LINES];
  }

  const unique: string[] = [];
  for (const piece of pieces.slice(0, 6)) {
    if (unique[unique.length - 1]?.toLowerCase() === piece.toLowerCase()) continue;
    if (piece.toLowerCase() === greeting.toLowerCase()) continue;
    unique.push(piece);
  }

  return [greeting, ...unique];
}

export function resolveWifePhotos(photos: string[]): string[] {
  return Array.from({ length: 5 }, (_, i) => photos[i] ?? '');
}

export function isDarkScene(sceneIndex: number): boolean {
  return sceneIndex === 3 || sceneIndex === 9;
}
