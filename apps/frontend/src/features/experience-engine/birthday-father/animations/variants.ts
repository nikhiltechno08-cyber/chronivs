const easeSoft = [0.22, 0.61, 0.36, 1] as const;

export const pageTurnOut = {
  initial: { opacity: 1, rotateY: 0, scale: 1, filter: 'brightness(1) blur(0px)' },
  exit: {
    opacity: 0,
    rotateY: -18,
    scale: 0.92,
    filter: 'brightness(1.15) blur(12px)',
    transition: { duration: 0.78, ease: easeSoft },
  },
};

export const pageTurnIn = {
  initial: { opacity: 0, rotateY: 10, scale: 1.04, filter: 'blur(14px) brightness(1.15)' },
  animate: {
    opacity: 1,
    rotateY: 0,
    scale: 1,
    filter: 'blur(0px) brightness(1)',
    transition: { duration: 0.95, ease: easeSoft },
  },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay, ease: easeSoft },
  }),
};
