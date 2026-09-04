'use client';

import { motion } from 'framer-motion';
import { useId, useState, type KeyboardEvent } from 'react';

import { useReducedMotion } from '@/animations/hooks/use-reduced-motion';
import { cn } from '@chronivs/ui';

import { type FaqItem } from './faq-content';

type FaqAccordionItemProps = {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <motion.span
      className="faq-accordion-icon"
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.span>
  );
}

export function FaqAccordionItem({ item, isOpen, onToggle, index }: FaqAccordionItemProps) {
  const panelId = useId();
  const buttonId = useId();
  const prefersReducedMotion = useReducedMotion();

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggle();
    }
  };

  return (
    <article className={cn('faq-accordion-item', isOpen && 'is-open')}>
      <h3 className="faq-accordion-question">
        <button
          id={buttonId}
          type="button"
          className="faq-accordion-trigger"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          onKeyDown={handleKeyDown}
        >
          <span className="faq-accordion-index" aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="faq-accordion-label">{item.question}</span>
          <ChevronIcon open={isOpen} />
        </button>
      </h3>

      <motion.div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        initial={false}
        animate={
          prefersReducedMotion
            ? { height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }
            : { height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }
        }
        transition={{
          duration: prefersReducedMotion ? 0 : 0.38,
          ease: [0.22, 0.61, 0.36, 1],
        }}
        className="faq-accordion-panel"
        aria-hidden={!isOpen}
      >
        <div className="faq-accordion-answer">
          <p>{item.answer}</p>
        </div>
      </motion.div>
    </article>
  );
}

type FaqAccordionProps = {
  items: FaqItem[];
  categoryId: string;
  defaultOpenId?: string;
};

export function FaqAccordion({ items, categoryId, defaultOpenId }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? null);

  return (
    <div className="faq-accordion" data-category={categoryId}>
      {items.map((item, index) => (
        <FaqAccordionItem
          key={item.id}
          item={item}
          index={index}
          isOpen={openId === item.id}
          onToggle={() => setOpenId((current) => (current === item.id ? null : item.id))}
        />
      ))}
    </div>
  );
}
