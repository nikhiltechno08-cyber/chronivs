import type { SceneId } from '../../types';

export const SCENE_ORDER: SceneId[] = [
  'surprise',
  'birthday',
  'beginning',
  'memories',
  'love',
  'heart',
  'celebration',
  'forever',
];

export const SCENE_COUNT = SCENE_ORDER.length;

export function getWorldPhase(sceneIndex: number): number {
  return sceneIndex + 1;
}

export const MEMORY_NOTES_DEFAULT = [
  'The first time you laughed at my joke, I knew I was in trouble.',
  'I still remember exactly what you were wearing that day.',
  'You make ordinary Tuesdays feel like adventures.',
  'Every message from you is the best part of my day.',
  'I never knew home could be a person, until I met you.',
] as const;

export const STAR_TRAITS = [
  { label: 'Smile', note: 'Your smile could end wars and start new ones — in my heart.', left: '14%', top: '24%', size: 24 },
  { label: 'Eyes', note: "I get lost in your eyes more than I'd ever admit.", left: '34%', top: '10%', size: 28 },
  { label: 'Laugh', note: 'Your laugh is my favorite sound in the entire world.', left: '58%', top: '16%', size: 25 },
  { label: 'Warmth', note: 'Just being near you feels like sunlight on a cold day.', left: '80%', top: '26%', size: 26 },
  { label: 'Kindness', note: 'The way you care for everyone around you amazes me daily.', left: '20%', top: '58%', size: 27 },
  { label: 'Soul', note: 'Somehow, you understand parts of me I never had to explain.', left: '50%', top: '66%', size: 25 },
  { label: 'Heart', note: 'Your heart is the warmest place I have ever known.', left: '78%', top: '60%', size: 29 },
] as const;

export const FINAL_SENTENCES = [
  'My Love,',
  'Before today, there is something I wanted to tell you.',
  'Every memory we made,',
  'every smile,',
  'every laugh,',
  'every hug,',
  'every heartbeat —',
  'made my world brighter.',
  'Happy Birthday ❤️',
] as const;

export const FINAL_LINES = [
  'Every birthday will pass…',
  "But you'll always remain my favorite chapter.",
] as const;

export const HEART_MEMORY_POSITIONS = [
  { left: '20%', top: '46%', delay: 0 },
  { left: '76%', top: '34%', delay: 0.6 },
  { left: '48%', top: '16%', delay: 1.2 },
  { left: '24%', top: '66%', delay: 1.8 },
  { left: '66%', top: '70%', delay: 2.4 },
] as const;

export function buildBirthdayHeadline(receiverName: string): string {
  return receiverName;
}

export function buildLetterText(customMessage: string): string {
  return customMessage;
}
