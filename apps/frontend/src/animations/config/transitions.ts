import type { Transition } from 'framer-motion';

import { MOTION_DEFAULTS, MOTION_SPRING } from '@/constants/animation';

export const defaultTransition: Transition = {
  duration: MOTION_DEFAULTS.duration,
  ease: MOTION_DEFAULTS.ease,
};

export const springTransition: Transition = MOTION_SPRING;

export const reducedMotionTransition: Transition = {
  duration: 0,
};

export const fadeTransition: Transition = {
  duration: 0.3,
  ease: [0.22, 1, 0.36, 1],
};

export const slideTransition: Transition = {
  duration: 0.4,
  ease: [0.22, 1, 0.36, 1],
};

export const scaleTransition: Transition = {
  duration: 0.35,
  ease: [0.34, 1.56, 0.64, 1],
};

export const blurTransition: Transition = {
  duration: 0.5,
  ease: [0.22, 1, 0.36, 1],
};

export const pageTransitionConfig: Transition = {
  duration: 0.4,
  ease: [0.22, 1, 0.36, 1],
};

export const sceneTransitionConfig: Transition = {
  duration: 0.6,
  ease: [0.22, 1, 0.36, 1],
};

export const textRevealTransition: Transition = {
  duration: 0.5,
  ease: [0.22, 1, 0.36, 1],
};

export const floatingTransition: Transition = {
  duration: 3,
  ease: 'easeInOut',
  repeat: Infinity,
  repeatType: 'reverse' as const,
};
