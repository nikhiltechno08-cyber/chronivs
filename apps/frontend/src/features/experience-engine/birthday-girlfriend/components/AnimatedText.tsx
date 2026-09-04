'use client';

import { motion } from 'framer-motion';
import { memo } from 'react';

import { useReducedMotion } from '@/animations/hooks/use-reduced-motion';

import { wordReveal } from '../animations/variants';

type AnimatedTextProps = {
  text: string;
  className?: string;
  staggerMs?: number;
  play?: boolean;
  onComplete?: () => void;
};

export const AnimatedText = memo(function AnimatedText({
  text,
  className = '',
  staggerMs = 90,
  play = true,
  onComplete,
}: AnimatedTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const words = text.split(' ');

  if (prefersReducedMotion) {
    return <p className={className}>{text}</p>;
  }

  return (
    <p className={`${className} animated-text-wrap`}>
      <span className="animated-text-reserve" aria-hidden="true">
        {text}
      </span>
      <span className="animated-text-layer">
        {words.map((word, i) => (
          <motion.span
            key={`${word}-${i}`}
            className="word shown"
            variants={wordReveal}
            initial="hidden"
            animate={play ? 'visible' : 'hidden'}
            transition={{ delay: (i * staggerMs) / 1000 }}
            onAnimationComplete={i === words.length - 1 ? onComplete : undefined}
            style={{ display: 'inline-block', marginRight: '0.28em' }}
          >
            {word}
          </motion.span>
        ))}
      </span>
    </p>
  );
});
