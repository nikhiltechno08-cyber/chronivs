import { buildActiveScenes } from '../../core/scene-availability';
import type { SceneId } from '../../types';

export const SCENE_ORDER: SceneId[] = [
  'father-welcome',
  'father-door',
  'father-timeline',
  'father-hands',
  'father-album',
  'father-lanterns',
  'father-voice',
  'father-letter',
  'father-celebration',
  'father-wishes',
  'father-thank-you',
  'father-ending',
];

export const SCENE_COUNT = SCENE_ORDER.length;

/** Scene indexes that still play once disabled scenes are filtered out. */
export const ACTIVE_SCENES = buildActiveScenes(SCENE_ORDER);

/** Matches HTML setTheme(i) — worldPhase is 1-based scene index */
export function getWorldPhase(sceneIndex: number): number {
  return sceneIndex + 1;
}

/** Soft light chrome for parchment chapters (HTML default look) */
export function isLightChrome(worldPhase: number): boolean {
  // Dark only for wishes (10). Lanterns (6) use golden light like Chapter Seven.
  return worldPhase !== 10;
}

export const FATHER_PHOTO_GRADIENTS = [
  'linear-gradient(150deg, #d4a65c, #b9793c 55%, #6b4a32)',
  'linear-gradient(150deg, #f2c879, #d4a65c 55%, #8a5a32)',
  'linear-gradient(150deg, #e8c48a, #c4894a 55%, #4a2f1d)',
  'linear-gradient(150deg, #f3e6d2, #d4a65c 50%, #6b4a32)',
  'linear-gradient(150deg, #f2c879, #b9793c 60%, #4a2f1d)',
] as const;

export const TIMELINE_STOPS = [
  { age: 'Age 5', quote: 'You taught me to ride without letting go.' },
  { age: 'Age 10', quote: 'You sat through every school play, front row.' },
  { age: 'Age 15', quote: 'You let me fall, and stayed close enough to catch me.' },
  { age: 'Age 20', quote: 'You believed in the plan before I did.' },
  { age: 'Today', quote: 'Still my first call, every single time.' },
] as const;

export const HANDS_TEXT =
  'There is a kind of love that never asks to be noticed — it simply shows up, every single day, in ordinary hands doing extraordinary things.';

export const ALBUM_PAGES = [
  { emoji: '🚲', caption: 'The summer you let go of the bike — and I didn\u2019t fall.' },
  { emoji: '🏕️', caption: 'Every campfire, every terrible joke, every perfect night.' },
  { emoji: '🎓', caption: 'You cried before I did. I saw you wipe it away.' },
] as const;

export const LANTERN_LESSONS = [
  '"Never let money change who you are at the table."',
  '"Say sorry first — pride never kept anyone warm."',
  '"Work quietly. Let the results speak."',
  '"Family isn\u2019t a duty. It\u2019s the whole point."',
  '"Always come home for dinner if you can."',
] as const;

export const LANTERN_POSITIONS = [
  { top: '60%', left: '10%' },
  { top: '20%', left: '26%' },
  { top: '70%', left: '48%' },
  { top: '15%', left: '68%' },
  { top: '55%', left: '84%' },
] as const;

export const WISHES = [
  'That your mornings stay unhurried and your coffee stays warm.',
  'That every road trip has good music and no wrong turns.',
  'That you know, without doubt, how loved you are.',
  'That your garden grows exactly what you hoped for.',
  'That we get many, many more birthdays like this one.',
] as const;

export const WISH_POSITIONS = [
  { top: '30%', left: '15%' },
  { top: '20%', left: '70%' },
  { top: '60%', left: '40%' },
  { top: '55%', left: '85%' },
  { top: '72%', left: '25%' },
] as const;

export const DEFAULT_LETTER_LINES = [
  'Dear Papa,',
  "I don't say this enough, so let me say it slowly.",
  'Thank you for the early mornings, the long drives, the quiet sacrifices I only understood years later.',
  'You gave me a childhood I never had to recover from — and that is the rarest gift there is.',
  'With all my love, always.',
] as const;

export function buildFatherLetterLines(customMessage: string, fatherName: string): string[] {
  const name = fatherName.trim() || 'Papa';
  const greeting = `Dear ${name},`;
  const trimmed = customMessage.trim();

  if (!trimmed) {
    return [greeting, ...DEFAULT_LETTER_LINES.slice(1)];
  }

  const withoutGreeting = trimmed.replace(/^dear\s+[^,\n]+,\s*/i, '').trim();
  const body = withoutGreeting || trimmed;
  const pieces = body
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (pieces.length === 0) {
    return [greeting, ...DEFAULT_LETTER_LINES.slice(1)];
  }

  const unique: string[] = [];
  for (const piece of pieces.slice(0, 6)) {
    if (unique[unique.length - 1]?.toLowerCase() === piece.toLowerCase()) continue;
    if (piece.toLowerCase() === greeting.toLowerCase()) continue;
    unique.push(piece);
  }

  return [greeting, ...unique];
}

export function resolveFatherPhotos(photos: string[]): string[] {
  return Array.from({ length: 5 }, (_, i) => photos[i] ?? '');
}
