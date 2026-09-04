export const heroTitleTransition = {
  duration: 0.9,
  ease: 'easeOut' as const,
};

export const heroActionsTransition = {
  duration: 0.6,
  ease: 'easeOut' as const,
  delay: 0.25,
};

export const heroFadeTransition = {
  duration: 1,
  ease: [0.22, 0.61, 0.36, 1] as const,
};

export const heroDeviceTransition = {
  duration: 1.2,
  ease: 'easeOut' as const,
};

export const HERO_ENTRANCE_DELAYS = {
  eyebrow: 0.4,
  lineBase: 0.2,
  lineStagger: 0.14,
  sub: 0.7,
  actions: 0.9,
  scrollCue: 1.4,
  deviceBase: 0.5,
  deviceStagger: 0.22,
};

export const deviceBaseTransforms: Record<string, string> = {
  laptop: 'translateY(-50%) rotateY(6deg) rotateX(2deg)',
  tablet: 'rotateY(-10deg) rotateX(3deg) rotateZ(2deg)',
  phone: 'rotateY(-6deg) rotateZ(-3deg)',
};

export const mobileDeviceTransforms: Record<string, string> = {
  laptop: 'translate(-50%, -50%) rotateY(0) rotateX(0)',
  tablet: 'rotateY(0) rotateZ(-4deg)',
  phone: 'rotateZ(4deg)',
};
