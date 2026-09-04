'use client';

import { motion } from 'framer-motion';
import { type CSSProperties } from 'react';

import { useReducedMotion } from '@/animations/hooks/use-reduced-motion';
import { Assets } from '@/config/assets';
import { Container } from '@/components/landing/shared/Container';
import { Eyebrow } from '@/components/landing/shared/Eyebrow';
import { GlassButton } from '@/components/landing/shared/GlassButton';
import { ScrollReveal, scrollRevealDelay } from '@/components/landing/shared/ScrollReveal';

import { AboutParticles } from '@/components/landing/About/AboutParticles';
import { FaqAccordion } from './FaqAccordion';
import { FAQ_CATEGORIES, FAQ_CTA, FAQ_HERO } from './faq-content';

import '@/components/landing/Hero/hero-particles.css';
import './faq.css';

const heroTitleTransition = {
  duration: 1,
  delay: 0.12,
  ease: [0.22, 0.61, 0.36, 1] as const,
};

export function FaqPage() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="faq-page">
      <section aria-labelledby="faq-hero-title" className="faq-hero">
        <div
          className="faq-hero-glow"
          aria-hidden="true"
          style={
            {
              '--landing-hero-background-image': `url("${Assets.hero.background}")`,
            } as CSSProperties
          }
        />
        <AboutParticles />

        <Container>
          <div className="faq-hero-inner">
            <Eyebrow className="faq-hero-eyebrow">{FAQ_HERO.eyebrow}</Eyebrow>

            <motion.h1
              id="faq-hero-title"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={heroTitleTransition}
            >
              {FAQ_HERO.title}
            </motion.h1>

            <motion.p
              className="faq-hero-desc"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...heroTitleTransition, delay: 0.22 }}
            >
              {FAQ_HERO.description}
            </motion.p>
          </div>
        </Container>
      </section>

      <section aria-label="FAQ categories" className="faq-content">
        <Container>
          <div className="faq-categories">
            {FAQ_CATEGORIES.map((category, categoryIndex) => (
              <ScrollReveal key={category.id} delay={scrollRevealDelay(categoryIndex + 1)}>
                <div className="faq-category" id={category.id}>
                  <div className="faq-category-head">
                    <span className="faq-category-mark" aria-hidden="true" />
                    <h2>{category.title}</h2>
                  </div>
                  <FaqAccordion
                    items={category.items}
                    categoryId={category.id}
                    defaultOpenId={categoryIndex === 0 ? category.items[0]?.id : undefined}
                  />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </section>

      <section aria-labelledby="faq-cta-title" className="landing-cta faq-cta">
        <div className="landing-cta-glow" aria-hidden="true" />
        <Container>
          <ScrollReveal>
            <h2 id="faq-cta-title">{FAQ_CTA.title}</h2>
          </ScrollReveal>
          <ScrollReveal delay={scrollRevealDelay(2)}>
            <GlassButton href={FAQ_CTA.href} className="faq-cta-btn">
              {FAQ_CTA.button}
            </GlassButton>
          </ScrollReveal>
        </Container>
      </section>
    </div>
  );
}
