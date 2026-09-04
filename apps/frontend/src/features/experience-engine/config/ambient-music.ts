import type { ExperienceTemplateId } from '../types';
import { Assets } from '@/config/assets';

/**
 * Built-in ambient tracks — paths defined in `@/config/assets`.
 * Only romantic GF / anniversary / proposal templates use Perfect for now.
 */
export const TEMPLATE_AMBIENT_MUSIC: Partial<Record<ExperienceTemplateId, string>> = {
  'birthday-girlfriend': Assets.music.perfect,
  'anniversary-wife': Assets.music.perfect,
  'proposal-girlfriend': Assets.music.perfect,
};

export function getTemplateAmbientMusic(templateId: ExperienceTemplateId): string | undefined {
  return TEMPLATE_AMBIENT_MUSIC[templateId];
}

/** Fired after Tap-to-Begin (or first gesture) so autoplay-blocked music can start. */
export const AUDIO_UNLOCK_EVENT = 'chronivs-audio-unlock';

export function unlockExperienceAudio() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(AUDIO_UNLOCK_EVENT));
}
