'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

import { useReducedMotion } from '@/animations/hooks/use-reduced-motion';
import { cn } from '@chronivs/ui';

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

const delays = [0, 0.08, 0.16, 0.24, 0.32, 0.4];

export function ScrollReveal({ children, className, delay = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 28, filter: 'blur(6px)' }}
      animate={
        isInView || prefersReducedMotion
          ? { opacity: 1, y: 0, filter: 'blur(0px)' }
          : { opacity: 0, y: 28, filter: 'blur(6px)' }
      }
      transition={{
        duration: prefersReducedMotion ? 0 : 1,
        delay: prefersReducedMotion ? 0 : delay,
        ease: [0.22, 0.61, 0.36, 1],
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

export function scrollRevealDelay(index: number): number {
  return delays[index % delays.length] ?? 0;
}
