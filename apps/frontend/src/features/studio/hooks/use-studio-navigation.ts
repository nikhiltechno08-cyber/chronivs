'use client';

import { useCallback } from 'react';

import { useStudioStore } from '../store/studio-store';

export function useStudioNavigation() {
  const step = useStudioStore((s) => s.step);
  const nextStep = useStudioStore((s) => s.nextStep);
  const prevStep = useStudioStore((s) => s.prevStep);
  const setStep = useStudioStore((s) => s.setStep);

  const goNext = useCallback(() => {
    nextStep();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [nextStep]);

  const goBack = useCallback(() => {
    if (step > 1) {
      prevStep();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [prevStep, step]);

  const goToStep = useCallback(
    (target: typeof step) => {
      setStep(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setStep],
  );

  return { step, goNext, goBack, goToStep };
}
