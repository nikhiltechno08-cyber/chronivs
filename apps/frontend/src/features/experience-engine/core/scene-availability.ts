import type { SceneId } from '../types';

/**
 * Scenes below only pay off once the sender can attach a voice track. The studio
 * voice step is switched off, so they are skipped rather than deleted — flip this
 * flag to bring every one of them back untouched.
 */
export const AUDIO_SCENES_ENABLED = false;

const AUDIO_SCENE_IDS: readonly SceneId[] = ['wife-vinyl', 'voice', 'father-voice'];

export function isSceneEnabled(id: SceneId): boolean {
  return AUDIO_SCENES_ENABLED || !AUDIO_SCENE_IDS.includes(id);
}

/**
 * Positions in the template's SCENE_ORDER that still play, in order. Indexes stay
 * aligned with the original order so theme/particle lookups keep working.
 */
export function buildActiveScenes(order: readonly SceneId[]): readonly number[] {
  const active = order.map((id, index) => (isSceneEnabled(id) ? index : -1)).filter((i) => i >= 0);
  return active.length > 0 ? active : order.map((_, index) => index);
}

export function nextActiveScene(active: readonly number[], current: number): number {
  const position = active.indexOf(current);
  if (position === -1) {
    return active.find((index) => index > current) ?? current;
  }
  return active[Math.min(position + 1, active.length - 1)]!;
}

/** 0-based position within the scenes that actually play (for progress dots). */
export function activeScenePosition(active: readonly number[], current: number): number {
  const position = active.indexOf(current);
  return position === -1 ? 0 : position;
}
