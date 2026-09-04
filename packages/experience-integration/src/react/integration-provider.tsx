'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

import type { ExperienceContextSnapshot } from '../types/context';

import {
  createExperienceController,
  type ExperienceController,
} from '../controller/experience-controller';
import type { ExperienceLifecycle } from '../enums/experience-lifecycle';
import type { ExperienceControllerConfig } from '../types/context';
import type { ExperienceModulePorts } from '../types/ports';

type ExperienceIntegrationContextValue = {
  readonly controller: ExperienceController;
};

const ExperienceIntegrationContext = createContext<ExperienceIntegrationContextValue | null>(null);

export type ExperienceIntegrationProviderProps = {
  readonly children: ReactNode;
  readonly controller?: ExperienceController;
  readonly ports?: ExperienceModulePorts;
  readonly config?: ExperienceControllerConfig;
};

/**
 * React provider for Experience Integration Layer.
 * NOT wired to Studio — future composition root only.
 */
export function ExperienceIntegrationProvider({
  children,
  controller: externalController,
  ports,
  config,
}: ExperienceIntegrationProviderProps) {
  const controllerRef = useRef<ExperienceController | null>(externalController ?? null);

  if (!controllerRef.current) {
    controllerRef.current = externalController ?? createExperienceController(ports, config);
  }

  const controller = controllerRef.current;

  useEffect(() => {
    void controller.initialize();
    return () => controller.dispose();
  }, [controller]);

  const value = useMemo(() => ({ controller }), [controller]);

  return (
    <ExperienceIntegrationContext.Provider value={value}>
      {children}
    </ExperienceIntegrationContext.Provider>
  );
}

export function useExperienceController(): ExperienceController {
  const ctx = useContext(ExperienceIntegrationContext);
  if (!ctx) {
    throw new Error('useExperienceController requires ExperienceIntegrationProvider');
  }
  return ctx.controller;
}

export function useExperienceContext(): ExperienceContextSnapshot {
  const controller = useExperienceController();

  return useSyncExternalStore(
    (listener) => controller.subscribe(listener),
    () => controller.getContext(),
    () => controller.getContext(),
  );
}

export function useExperienceLifecycle(): ExperienceLifecycle {
  return useExperienceContext().lifecycle;
}
