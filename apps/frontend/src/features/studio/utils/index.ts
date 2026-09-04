export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatDurationMinutes(photoCount: number, hasAudio: boolean): string {
  const estMin = 1 + Math.min(photoCount, 5) * 0.4 + (hasAudio ? 0.5 : 0);
  return `~${Math.max(1, Math.round(estMin))} min`;
}

export function generateId(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}`;
}

export { compressImageFile } from './compress-image';
export { saveSessionMedia, loadSessionMedia, clearSessionMedia } from './session-media';
