import type { StateStorage } from 'zustand/middleware';

/**
 * localStorage wrapper that never throws on quota or access errors.
 * Mirrors the Studio safe-storage pattern without modifying Studio.
 */
export const safeDraftStorage: StateStorage = {
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
