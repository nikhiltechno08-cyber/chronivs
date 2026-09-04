'use client';

import { motion } from 'framer-motion';
import { type CSSProperties } from 'react';

import { useReducedMotion } from '@/animations/hooks/use-reduced-motion';
import { Assets } from '@/config/assets';
import { AboutParticles } from '@/components/landing/About/AboutParticles';
import { Container } from '@/components/landing/shared/Container';
import { Eyebrow } from '@/components/landing/shared/Eyebrow';
import { GlassButton } from '@/components/landing/shared/GlassButton';
import { ScrollReveal, scrollRevealDelay } from '@/components/landing/shared/ScrollReveal';

import { LegalSectionCard } from './LegalSectionCard';
import { type LegalPageProps } from './types';

import '@/components/landing/Hero/hero-particles.css';
import './legal.css';

const heroTitleTransition = {
  duration: 1,
  delay: 0.12,
  ease: [0.22, 0.61, 0.36, 1] as const,
};

export function LegalPage({
  pageClassName = 'legal-page',
  hero,
  sections,
  cta,
  contentAriaLabel,
  heroTitleId,
  ctaTitleId,
}: LegalPageProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={pageClassName}>
      <section aria-labelledby={heroTitleId} className="legal-hero">
        <div
          className="legal-hero-glow"
          aria-hidden="true"
          style={
            {
              '--landing-hero-background-image': `url("${Assets.hero.background}")`,
            } as CSSProperties
          }
        />
        <AboutParticles />

        <Container>
          <div className="legal-hero-inner">
            <Eyebrow className="legal-hero-eyebrow">{hero.eyebrow}</Eyebrow>

            <motion.h1
              id={heroTitleId}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={heroTitleTransition}
            >
              {hero.title}
            </motion.h1>

            <motion.p
              className="legal-hero-desc"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...heroTitleTransition, delay: 0.22 }}
            >
              {hero.description}
            </motion.p>

            {hero.lastUpdated ? (
              <motion.p
                className="legal-hero-updated"
                initial={prefersReducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ...heroTitleTransition, delay: 0.32 }}
              >
                {hero.lastUpdated}
              </motion.p>
            ) : null}
          </div>
        </Container>
      </section>

      <section aria-label={contentAriaLabel} className="legal-content">
        <Container>
          <div className="legal-sections">
            {sections.map((section, index) => (
              <ScrollReveal key={section.id} delay={scrollRevealDelay(index + 1)}>
                <LegalSectionCard section={section} />
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </section>

      <section aria-labelledby={ctaTitleId} className="landing-cta legal-cta">
        <div className="landing-cta-glow" aria-hidden="true" />
        <Container>
          <ScrollReveal>
            <h2 id={ctaTitleId}>{cta.title}</h2>
          </ScrollReveal>
          <ScrollReveal delay={scrollRevealDelay(2)}>
            <GlassButton href={cta.href} className="legal-cta-btn">
              {cta.button}
            </GlassButton>
          </ScrollReveal>
        </Container>
      </section>
    </div>
  );
}
