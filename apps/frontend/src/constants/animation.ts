export const MOTION_DEFAULTS = {
  duration: 0.3,
  ease: [0.22, 1, 0.36, 1] as const,
} as const;

export const MOTION_SPRING = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};

export const MOTION_PAGE_TRANSITION = {
  duration: 0.4,
  ease: [0.22, 1, 0.36, 1] as const,
};

export const MOTION_SCENE_TRANSITION = {
  duration: 0.6,
  ease: [0.22, 1, 0.36, 1] as const,
};

export const STAGGER_CHILDREN = 0.08;
export const STAGGER_DELAY = 0.04;

export const LENIS_OPTIONS = {
  duration: 1.2,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
} as const;
