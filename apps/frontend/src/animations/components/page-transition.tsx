'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';

import { pageTransitionConfig } from '@/animations/config/transitions';
import { pageTransitionVariants } from '@/animations/variants';
import { useReducedMotion } from '@/animations/hooks/use-reduced-motion';
import type { PageTransitionType } from '@/types';

type PageTransitionProps = {
  children: ReactNode;
  type?: PageTransitionType;
};

const typeVariants = {
  fade: pageTransitionVariants,
  'slide-up': {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  'slide-down': {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
};

export function PageTransition({ children, type = 'fade' }: PageTransitionProps) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={prefersReducedMotion ? { hidden: {}, visible: {}, exit: {} } : typeVariants[type]}
        transition={prefersReducedMotion ? { duration: 0 } : pageTransitionConfig}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
