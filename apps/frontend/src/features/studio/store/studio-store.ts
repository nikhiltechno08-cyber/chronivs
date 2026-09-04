import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type {
  GeneratedExperience,
  OccasionKey,
  RelationshipKey,
  StudioAudio,
  StudioDraft,
  StudioPhase,
  StudioPhoto,
  StudioStep,
  TemplateConfig,
} from '../types';
import { getNextStudioStep, getPrevStudioStep, resolveStudioStep } from '../types';
import { migrateStudioStorage, safeStudioStorage } from './safe-storage';

migrateStudioStorage();

type StudioActions = {
  setStep: (step: StudioStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  setOccasion: (occasion: OccasionKey) => void;
  setRelationship: (relationship: RelationshipKey) => void;
  setSenderName: (name: string) => void;
  setReceiverName: (name: string) => void;
  setSpecialDate: (date: string) => void;
  setCustomMessage: (message: string) => void;
  setSelectedMessageIndex: (index: number) => void;
  addPhoto: (photo: StudioPhoto) => void;
  updatePhoto: (id: string, patch: Partial<StudioPhoto>) => void;
  removePhoto: (id: string) => void;
  replacePhotos: (photos: StudioPhoto[]) => void;
  setAudio: (audio: StudioAudio | null) => void;
  setTemplateConfig: (config: TemplateConfig) => void;
  setGeneratedExperience: (experience: GeneratedExperience) => void;
  setPhase: (phase: StudioPhase) => void;
  resetDraft: () => void;
  hydrateDetails: (
    details: Partial<
      Pick<
        StudioDraft,
        'senderName' | 'receiverName' | 'specialDate' | 'customMessage' | 'selectedMessageIndex'
      >
    >,
  ) => void;
};

export type StudioStore = StudioDraft & {
  phase: StudioPhase;
} & StudioActions;

/** Text-only fields persisted to localStorage — media stays in memory */
export type StudioPersisted = Pick<
  StudioStore,
  | 'step'
  | 'occasion'
  | 'relationship'
  | 'senderName'
  | 'receiverName'
  | 'specialDate'
  | 'customMessage'
  | 'selectedMessageIndex'
  | 'templateConfig'
  | 'generatedExperience'
>;

const initialDraft: StudioDraft = {
  step: 1,
  occasion: null,
  relationship: null,
  senderName: '',
  receiverName: '',
  specialDate: '',
  customMessage: '',
  selectedMessageIndex: 0,
  photos: [],
  audio: null,
  templateConfig: {},
  generatedExperience: null,
};

export const useStudioStore = create<StudioStore>()(
  persist<StudioStore, [], [], StudioPersisted>(
    (set, get) => ({
      ...initialDraft,
      phase: 'flow',

      setStep: (step) => set({ step: resolveStudioStep(step) }),
      nextStep: () => set({ step: getNextStudioStep(get().step) }),
      prevStep: () => set({ step: getPrevStudioStep(get().step) }),

      setOccasion: (occasion) => set({ occasion, relationship: null, selectedMessageIndex: 0 }),
      setRelationship: (relationship) => set({ relationship, selectedMessageIndex: 0 }),

      setSenderName: (senderName) => set({ senderName }),
      setReceiverName: (receiverName) => set({ receiverName }),
      setSpecialDate: (specialDate) => set({ specialDate }),
      setCustomMessage: (customMessage) => set({ customMessage }),
      setSelectedMessageIndex: (selectedMessageIndex) => set({ selectedMessageIndex }),

      addPhoto: (photo) =>
        set((state) => ({
          photos: state.photos.length < 5 ? [...state.photos, photo] : state.photos,
        })),
      updatePhoto: (id, patch) =>
        set((state) => ({
          photos: state.photos.map((photo) => (photo.id === id ? { ...photo, ...patch } : photo)),
        })),
      removePhoto: (id) =>
        set((state) => ({ photos: state.photos.filter((p) => p.id !== id) })),
      replacePhotos: (photos) => set({ photos }),

      setAudio: (audio) => set({ audio }),
      setTemplateConfig: (templateConfig) => set({ templateConfig }),
      setGeneratedExperience: (generatedExperience) => set({ generatedExperience }),
      setPhase: (phase) => set({ phase }),

      resetDraft: () => set({ ...initialDraft, phase: 'flow' }),

      hydrateDetails: (details) => set({ ...details }),
    }),
    {
      name: 'chronivs-studio-draft',
      storage: createJSONStorage(() => safeStudioStorage),
      partialize: (state): StudioPersisted => ({
        step: state.step,
        occasion: state.occasion,
        relationship: state.relationship,
        senderName: state.senderName,
        receiverName: state.receiverName,
        specialDate: state.specialDate,
        customMessage: state.customMessage,
        selectedMessageIndex: state.selectedMessageIndex ?? 0,
        templateConfig: state.templateConfig,
        generatedExperience: state.generatedExperience,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<StudioStore>;
        return {
          ...current,
          ...p,
          step: resolveStudioStep(p.step ?? current.step),
          selectedMessageIndex:
            typeof p.selectedMessageIndex === 'number' ? p.selectedMessageIndex : 0,
        };
      },
    },
  ),
);
