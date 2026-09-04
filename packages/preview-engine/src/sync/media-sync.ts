import type { RenderMediaData, RenderSettingsData } from '@chronivs/experience-renderer';

import type { PreviewDraftPayload } from '../types';

/** Extract media-relevant changes for selective sync. */
export function extractMediaDelta(
  prev: PreviewDraftPayload,
  next: PreviewDraftPayload,
): Record<string, unknown> {
  const delta: Record<string, unknown> = {};

  if (prev.photos !== next.photos) delta.photos = next.photos;
  if (prev.audio !== next.audio) delta.audio = next.audio;
  if (prev.puzzleImage !== next.puzzleImage) delta.puzzleImage = next.puzzleImage;

  return delta;
}

/** Check if rendered media has missing URLs requiring placeholders. */
export function hasMissingMedia(media: RenderMediaData): boolean {
  if (media.photos.length === 0) return true;
  return media.photos.some((p) => !p.url || p.url.startsWith('linear-gradient'));
}

/** Theme delta detection. */
export function extractThemeDelta(
  prev: PreviewDraftPayload,
  next: PreviewDraftPayload,
): PreviewDraftPayload['theme'] | undefined {
  if (JSON.stringify(prev.theme) === JSON.stringify(next.theme)) {
    return undefined;
  }
  return next.theme;
}

/** Merge settings for theme-only updates without full re-render. */
export function mergeThemeSettings(
  current: RenderSettingsData,
  themeRef: PreviewDraftPayload['theme'],
  presetId: string,
): RenderSettingsData {
  if (!themeRef) return current;

  return {
    ...current,
    theme: {
      ...current.theme,
      presetId: themeRef.presetId ?? presetId,
      mode: themeRef.mode ?? current.theme.mode,
      accentColor: themeRef.accentColor ?? current.theme.accentColor,
    },
  };
}
