import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Draft, DraftPatch } from '../types/draft';
import type { DraftId } from '../types/branded';
import { safeDraftStorage } from '../storage/safe-storage';

export interface DraftStoreState<TPayload extends Record<string, unknown>> {
  /** Active draft id pointer. */
  readonly activeDraftId: DraftId | null;
  /** In-memory draft cache keyed by id. */
  readonly drafts: Readonly<Record<string, Draft<TPayload>>>;
  /** Whether a save is in progress. */
  readonly isSaving: boolean;
  /** Last save error message. */
  readonly lastError: string | null;
}

export interface DraftStoreActions<TPayload extends Record<string, unknown>> {
  setActiveDraftId: (id: DraftId | null) => void;
  upsertDraft: (draft: Draft<TPayload>) => void;
  patchActiveDraft: (patch: DraftPatch<TPayload>) => void;
  removeDraft: (id: DraftId) => void;
  setSaving: (isSaving: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export type DraftStore<TPayload extends Record<string, unknown> = Record<string, unknown>> =
  DraftStoreState<TPayload> & DraftStoreActions<TPayload>;

export interface CreateDraftStoreOptions {
  /** Zustand persist storage key. */
  readonly persistKey?: string;
  /** Custom StateStorage (defaults to safeDraftStorage). */
  readonly storage?: typeof safeDraftStorage;
}

const initialState = {
  activeDraftId: null,
  drafts: {},
  isSaving: false,
  lastError: null,
} satisfies DraftStoreState<Record<string, unknown>>;

/**
 * Zustand store factory for draft state with localStorage persistence.
 *
 * Not wired to Studio — consumed via a future adapter layer.
 */
export function createDraftStore<TPayload extends Record<string, unknown> = Record<string, unknown>>(
  options: CreateDraftStoreOptions = {},
) {
  const persistKey = options.persistKey ?? 'chronivs-draft-store';

  return create<DraftStore<TPayload>>()(
    persist(
      (set, get) => ({
        ...initialState,
        activeDraftId: null,
        drafts: {},

        setActiveDraftId: (id) => set({ activeDraftId: id }),

        upsertDraft: (draft) =>
          set((state) => ({
            drafts: { ...state.drafts, [draft.id]: draft },
            activeDraftId: state.activeDraftId ?? draft.id,
          })),

        patchActiveDraft: (patch) => {
          const { activeDraftId, drafts } = get();
          if (!activeDraftId) return;

          const current = drafts[activeDraftId];
          if (!current) return;

          const updated: Draft<TPayload> = {
            ...current,
            ...patch,
            metadata: patch.metadata ? { ...current.metadata, ...patch.metadata } : current.metadata,
            payload: patch.payload
              ? ({ ...current.payload, ...patch.payload } as TPayload)
              : current.payload,
          };

          set({
            drafts: { ...drafts, [activeDraftId]: updated },
          });
        },

        removeDraft: (id) =>
          set((state) => {
            const next = { ...state.drafts };
            delete next[id];
            return {
              drafts: next,
              activeDraftId: state.activeDraftId === id ? null : state.activeDraftId,
            };
          }),

        setSaving: (isSaving) => set({ isSaving }),
        setError: (lastError) => set({ lastError }),
        reset: () => set({ ...initialState, drafts: {} }),
      }),
      {
        name: persistKey,
        storage: createJSONStorage(() => options.storage ?? safeDraftStorage),
        partialize: (state) => ({
          activeDraftId: state.activeDraftId,
          drafts: state.drafts,
        }),
      },
    ),
  );
}
