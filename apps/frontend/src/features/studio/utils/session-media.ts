import type { StudioAudio, StudioPhoto } from '@/features/studio/types';

const MEDIA_SESSION_KEY = 'chronivs-studio-media';

type SessionMedia = {
  photos: StudioPhoto[];
  audio: StudioAudio | null;
};

/** Persist only Cloudinary metadata — never base64 image payloads. */
function toSessionPhoto(photo: StudioPhoto): StudioPhoto | null {
  const secureUrl = photo.secureUrl || (photo.dataUrl?.startsWith('http') ? photo.dataUrl : '');
  if (!secureUrl || photo.uploadStatus === 'error' || photo.uploadStatus === 'cancelled') {
    return null;
  }
  return {
    id: photo.id,
    dataUrl: secureUrl,
    name: photo.name,
    mediaId: photo.mediaId,
    publicId: photo.publicId,
    secureUrl,
    width: photo.width,
    height: photo.height,
    format: photo.format,
    bytes: photo.bytes,
    uploadStatus: 'complete',
    uploadProgress: 100,
  };
}

export function saveSessionMedia(photos: StudioPhoto[], audio: StudioAudio | null): void {
  if (typeof window === 'undefined') return;

  try {
    const payload: SessionMedia = {
      photos: photos.map(toSessionPhoto).filter((p): p is StudioPhoto => Boolean(p)),
      audio,
    };
    sessionStorage.setItem(MEDIA_SESSION_KEY, JSON.stringify(payload));
  } catch {
    // Best-effort — experience still renders with fallbacks
  }
}

export function loadSessionMedia(): SessionMedia | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = sessionStorage.getItem(MEDIA_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionMedia;
  } catch {
    return null;
  }
}

export function clearSessionMedia(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(MEDIA_SESSION_KEY);
  } catch {
    /* ignore */
  }
}
