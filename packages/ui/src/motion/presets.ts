export type MotionVariantSet = Record<string, Record<string, unknown>>;

export type MotionTransitionConfig = {
  duration?: number;
  delay?: number;
  ease?: number[] | string;
  type?: 'spring' | 'tween';
  stiffness?: number;
  damping?: number;
  mass?: number;
  repeat?: number;
  repeatType?: 'loop' | 'mirror' | 'reverse';
};

export type MotionPreset = {
  name: string;
  duration: number;
  delay: number;
  ease: number[] | string;
  spring?: { stiffness: number; damping: number; mass?: number };
  variants?: MotionVariantSet;
  transition?: MotionTransitionConfig;
};

const cinematicEase = [0.22, 0.61, 0.36, 1] as const;
const springDefault = { stiffness: 300, damping: 30, mass: 1 };

export const fade: MotionPreset = {
  name: 'fade',
  duration: 0.3,
  delay: 0,
  ease: [...cinematicEase],
  variants: { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } },
  transition: { duration: 0.3, ease: [...cinematicEase] },
};

export const fadeUp: MotionPreset = {
  name: 'fadeUp',
  duration: 0.5,
  delay: 0,
  ease: [...cinematicEase],
  variants: {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
  },
  transition: { duration: 0.5, ease: [...cinematicEase] },
};

export const fadeDown: MotionPreset = {
  name: 'fadeDown',
  duration: 0.5,
  delay: 0,
  ease: [...cinematicEase],
  variants: {
    hidden: { opacity: 0, y: -24 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 16 },
  },
  transition: { duration: 0.5, ease: [...cinematicEase] },
};

export const blurReveal: MotionPreset = {
  name: 'blurReveal',
  duration: 0.6,
  delay: 0,
  ease: [...cinematicEase],
  variants: {
    hidden: { opacity: 0, filter: 'blur(8px)' },
    visible: { opacity: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, filter: 'blur(8px)' },
  },
  transition: { duration: 0.6, ease: [...cinematicEase] },
};

export const heroReveal: MotionPreset = {
  name: 'heroReveal',
  duration: 0.7,
  delay: 0.2,
  ease: [...cinematicEase],
  variants: {
    hidden: { opacity: 0, y: 40, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.98 },
  },
  transition: { duration: 0.7, delay: 0.2, ease: [...cinematicEase] },
};

export const textReveal: MotionPreset = {
  name: 'textReveal',
  duration: 0.5,
  delay: 0,
  ease: [...cinematicEase],
  variants: {
    hidden: { opacity: 0, y: '100%' },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: '-100%' },
  },
  transition: { duration: 0.5, ease: [...cinematicEase] },
};

export const imageReveal: MotionPreset = {
  name: 'imageReveal',
  duration: 0.8,
  delay: 0,
  ease: [...cinematicEase],
  variants: {
    hidden: { opacity: 0, scale: 1.05 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
  },
  transition: { duration: 0.8, ease: [...cinematicEase] },
};

export const scale: MotionPreset = {
  name: 'scale',
  duration: 0.35,
  delay: 0,
  ease: [0.34, 1.56, 0.64, 1],
  spring: springDefault,
  variants: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  transition: { type: 'spring', ...springDefault },
};

export const floating: MotionPreset = {
  name: 'floating',
  duration: 3,
  delay: 0,
  ease: 'easeInOut',
  variants: {
    initial: { y: 0 },
    animate: { y: [-8, 8, -8] },
  },
  transition: { duration: 3, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' },
};

export const pulse: MotionPreset = {
  name: 'pulse',
  duration: 2,
  delay: 0,
  ease: 'easeInOut',
  variants: {
    initial: { opacity: 1, scale: 1 },
    animate: { opacity: [1, 0.85, 1], scale: [1, 1.02, 1] },
  },
  transition: { duration: 2, ease: 'easeInOut', repeat: Infinity },
};

export const confetti: MotionPreset = {
  name: 'confetti',
  duration: 2.5,
  delay: 0,
  ease: [...cinematicEase],
  variants: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  },
  transition: { duration: 2.5, ease: [...cinematicEase] },
};

export const fireworks: MotionPreset = {
  name: 'fireworks',
  duration: 3,
  delay: 0,
  ease: [...cinematicEase],
  variants: {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0 },
  },
  transition: { duration: 3, ease: [...cinematicEase] },
};

export const particleMotion: MotionPreset = {
  name: 'particleMotion',
  duration: 4,
  delay: 0,
  ease: 'linear',
  variants: {
    initial: { y: 0, opacity: 0.3 },
    animate: { y: -100, opacity: [0.3, 0.6, 0] },
  },
  transition: { duration: 4, ease: 'linear', repeat: Infinity },
};

export const sceneTransition: MotionPreset = {
  name: 'sceneTransition',
  duration: 0.6,
  delay: 0,
  ease: [...cinematicEase],
  variants: {
    hidden: { opacity: 0, scale: 1.02 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
  },
  transition: { duration: 0.6, ease: [...cinematicEase] },
};

export const pageTransition: MotionPreset = {
  name: 'pageTransition',
  duration: 0.4,
  delay: 0,
  ease: [...cinematicEase],
  variants: {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  },
  transition: { duration: 0.4, ease: [...cinematicEase] },
};

export const motionPresets = {
  fade,
  fadeUp,
  fadeDown,
  blurReveal,
  heroReveal,
  textReveal,
  imageReveal,
  scale,
  floating,
  pulse,
  confetti,
  fireworks,
  particleMotion,
  sceneTransition,
  pageTransition,
} as const;

export type MotionPresetName = keyof typeof motionPresets;

export function getMotionPreset(name: MotionPresetName): MotionPreset {
  return motionPresets[name];
}
