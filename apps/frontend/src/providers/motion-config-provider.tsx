'use client';

import { LazyMotion, domAnimation, MotionConfig } from 'framer-motion';
import { type ReactNode } from 'react';

import { defaultTransition } from '@/animations/config/transitions';
import { useReducedMotion } from '@/animations/hooks/use-reduced-motion';

type MotionConfigProviderProps = {
  children: ReactNode;
};

export function MotionConfigProvider({ children }: MotionConfigProviderProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig
        reducedMotion={prefersReducedMotion ? 'always' : 'user'}
        transition={prefersReducedMotion ? { duration: 0 } : defaultTransition}
      >
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
