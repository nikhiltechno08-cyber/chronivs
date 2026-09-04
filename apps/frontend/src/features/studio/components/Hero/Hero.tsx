'use client';

import { motion } from 'framer-motion';
import { memo, type ReactNode } from 'react';

const panelEase = [0.22, 0.61, 0.36, 1] as const;

type PanelHeadProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export const PanelHead = memo(function PanelHead({ eyebrow, title, description }: PanelHeadProps) {
  return (
    <motion.header
      className="mb-12 text-center"
      initial={{ opacity: 0, filter: 'blur(8px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.6, ease: panelEase }}
    >
      <span className="studio-mono mb-4 block text-[11px] tracking-[0.2em] text-[var(--studio-gold)] uppercase">
        {eyebrow}
      </span>
      <h1 className="studio-serif text-[clamp(28px,4vw,42px)] leading-[1.15] font-normal text-[var(--studio-white)] italic">
        {title}
      </h1>
      {description && (
        <p className="mx-auto mt-3.5 max-w-[420px] text-[15px] leading-relaxed text-[var(--studio-gray)]">
          {description}
        </p>
      )}
    </motion.header>
  );
});

type StepPanelProps = {
  step: number;
  currentStep: number;
  children: ReactNode;
};

export const StepPanel = memo(function StepPanel({ step, currentStep, children }: StepPanelProps) {
  if (step !== currentStep) return null;

  return (
    <motion.section
      key={step}
      initial={{ opacity: 0, y: 22, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
      transition={{ duration: 0.7, ease: panelEase }}
      aria-label={`Step ${step}`}
      className="w-full max-w-[760px]"
    >
      {children}
    </motion.section>
  );
});
