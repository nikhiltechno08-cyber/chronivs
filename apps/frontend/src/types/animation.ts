import type { Transition, Variants } from 'framer-motion';

export type AnimationDirection = 'up' | 'down' | 'left' | 'right';

export type BaseAnimationProps = {
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
};

export type MotionVariantSet = Variants;

export type MotionTransitionConfig = Transition;

export type ParallaxConfig = {
  speed?: number;
  direction?: 'vertical' | 'horizontal';
  offset?: [string, string];
};

export type SceneTransitionType = 'fade' | 'slide' | 'scale' | 'blur';

export type PageTransitionType = 'fade' | 'slide-up' | 'slide-down';
