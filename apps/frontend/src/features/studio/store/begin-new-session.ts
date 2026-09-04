import { clearSessionMedia } from '../utils/session-media';
import { useStudioStore } from './studio-store';

/** Wipe draft + session media so Create Experience always opens a blank studio. */
export function beginNewStudioSession(): void {
  clearSessionMedia();

  try {
    void useStudioStore.persist.clearStorage();
  } catch {
    /* ignore storage errors */
  }

  useStudioStore.getState().resetDraft();
}
