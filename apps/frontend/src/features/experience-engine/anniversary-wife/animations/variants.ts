const easeDefault = [0.4, 0, 0.2, 1] as const;

/** Matches HTML .scene leaving — faster exit so next scene can take over (~0.52s handoff feel) */
export const sceneOut = {
  exit: {
    opacity: 0,
    scale: 0.965,
    transition: {
      opacity: { duration: 0.55, ease: 'easeInOut' as const },
      scale: { duration: 0.55, ease: 'easeInOut' as const },
    },
  },
};

export const sceneIn = {
  initial: { opacity: 0, scale: 1.035 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      opacity: { duration: 1.5, ease: 'easeInOut' as const },
      scale: { duration: 2, ease: 'easeInOut' as const },
    },
  },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 1.2, delay, ease: easeDefault },
  }),
};
