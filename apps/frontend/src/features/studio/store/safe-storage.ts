import type { StateStorage } from 'zustand/middleware';

const STORAGE_KEY = 'chronivs-studio-draft';

/** Strip legacy photo/audio blobs that exceeded localStorage quota */
export function migrateStudioStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw) as { state?: Record<string, unknown> };
    const state = parsed?.state;
    if (!state) return;

    const hasMedia = Array.isArray(state.photos) || state.audio != null;
    if (!hasMedia) return;

    delete state.photos;
    delete state.audio;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
}

/** localStorage wrapper that never throws on quota errors */
export const safeStudioStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      // Quota exceeded — clear legacy draft and retry once with current (text-only) payload
      try {
        localStorage.removeItem(name);
        localStorage.setItem(name, value);
      } catch {
        // Persist skipped; in-memory state remains valid for the session
      }
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};
