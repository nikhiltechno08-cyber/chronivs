const easeSoft = [0.22, 1, 0.36, 1] as const;

export const pageTurnOut = {
  initial: { opacity: 1, rotateY: 0, scale: 1, filter: 'brightness(1) blur(0px)' },
  exit: {
    opacity: 0,
    rotateY: -46,
    scale: 0.82,
    filter: 'brightness(0.8) blur(3px)',
    transition: { duration: 0.95, ease: easeSoft },
  },
};

export const pageTurnIn = {
  initial: { opacity: 0, rotateY: 20, scale: 0.88, filter: 'blur(8px) brightness(1.35)' },
  animate: {
    opacity: 1,
    rotateY: 0,
    scale: 1,
    filter: 'blur(0px) brightness(1)',
    transition: { duration: 0.95, ease: easeSoft },
  },
};

export const fadeUpReveal = {
  hidden: { opacity: 0, y: 10 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: easeSoft },
  }),
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.25 },
  },
};

export const wordReveal = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
};

export const reducedMotionVariants = {
  hidden: {},
  visible: {},
  exit: {},
};
