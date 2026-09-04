'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { createExperience, touchExperience } from '@/lib/createExperience';
import type { ExperienceData } from '@/types/experience';

type ExperienceContextValue = {
  experienceData: ExperienceData;
  setExperienceData: (data: ExperienceData) => void;
  updateExperienceData: (patch: Partial<ExperienceData>) => void;
  resetExperienceData: (defaults?: Partial<ExperienceData>) => void;
};

const ExperienceContext = createContext<ExperienceContextValue | null>(null);

type ExperienceProviderProps = {
  children: ReactNode;
  /** Seed document — typically built from studio via adapter */
  initialData?: ExperienceData;
};

export function ExperienceProvider({ children, initialData }: ExperienceProviderProps) {
  const [experienceData, setExperienceDataState] = useState<ExperienceData>(
    () => initialData ?? createExperience(),
  );

  const setExperienceData = useCallback((data: ExperienceData) => {
    setExperienceDataState(data);
  }, []);

  const updateExperienceData = useCallback((patch: Partial<ExperienceData>) => {
    setExperienceDataState((prev) => touchExperience(prev, patch));
  }, []);

  const resetExperienceData = useCallback((defaults?: Partial<ExperienceData>) => {
    setExperienceDataState(touchExperience(createExperience(), defaults ?? {}));
  }, []);

  const value = useMemo(
    () => ({
      experienceData,
      setExperienceData,
      updateExperienceData,
      resetExperienceData,
    }),
    [experienceData, resetExperienceData, setExperienceData, updateExperienceData],
  );

  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
}

export function useExperience(): ExperienceContextValue {
  const ctx = useContext(ExperienceContext);
  if (!ctx) {
    throw new Error('useExperience must be used within ExperienceProvider');
  }
  return ctx;
}

export function useOptionalExperience(): ExperienceContextValue | null {
  return useContext(ExperienceContext);
}
