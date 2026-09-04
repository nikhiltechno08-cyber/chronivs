const easeProp = [0.22, 0.61, 0.36, 1] as const;

/** Matches HTML .scene.leaving — opacity 1.1s, transform 1.3s, blur 1.1s */
export const sceneOut = {
  exit: {
    opacity: 0,
    scale: 0.98,
    filter: 'blur(6px)',
    transition: {
      opacity: { duration: 1.1, ease: easeProp },
      scale: { duration: 1.3, ease: easeProp },
      filter: { duration: 1.1, ease: easeProp },
    },
  },
};

/** Soft crossfade when bridge heart dissolves into proposal — no blur cut */
export const bridgeHandoffEnter = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 1.4, ease: easeProp },
  },
};

export const bridgeHandoffExit = {
  exit: {
    opacity: 0,
    transition: { duration: 1.1, ease: easeProp },
  },
};

/** Matches HTML .scene.active entrance */
export const sceneIn = {
  initial: { opacity: 0, scale: 1.02, filter: 'blur(6px)' },
  animate: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      opacity: { duration: 1.1, ease: easeProp },
      scale: { duration: 1.3, ease: easeProp },
      filter: { duration: 1.1, ease: easeProp },
    },
  },
};
