'use client';

import { motion } from 'framer-motion';
import { type CSSProperties } from 'react';

import { useReducedMotion } from '@/animations/hooks/use-reduced-motion';
import { Assets } from '@/config/assets';
import { LANDING_LINKS } from '@/components/landing/data';
import { Container } from '@/components/landing/shared/Container';
import { Eyebrow } from '@/components/landing/shared/Eyebrow';
import { PrimaryButton } from '@/components/landing/shared/PrimaryButton';
import { ScrollReveal, scrollRevealDelay } from '@/components/landing/shared/ScrollReveal';
import { SectionHead } from '@/components/landing/shared/SectionHead';

import {
  ABOUT_CTA,
  ABOUT_HERO,
  ABOUT_TIMELINE,
  ABOUT_VALUES,
  ABOUT_VISION_CARDS,
  ABOUT_WHY,
} from './about-content';
import { AboutParticles } from './AboutParticles';

import '../Hero/hero-particles.css';
import './about.css';

const heroTitleTransition = {
  duration: 1,
  delay: 0.12,
  ease: [0.22, 0.61, 0.36, 1] as const,
};

const heroActionsTransition = {
  duration: 0.9,
  delay: 0.38,
  ease: [0.22, 0.61, 0.36, 1] as const,
};

export function AboutPage() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="about-page">
      <section aria-labelledby="about-hero-title" className="about-hero">
        <div
          className="about-hero-glow"
          aria-hidden="true"
          style={
            {
              '--landing-hero-background-image': `url("${Assets.hero.background}")`,
            } as CSSProperties
          }
        />
        <AboutParticles />

        <Container>
          <div className="about-hero-inner">
            <Eyebrow className="about-hero-eyebrow">{ABOUT_HERO.eyebrow}</Eyebrow>

            <motion.h1
              id="about-hero-title"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={heroTitleTransition}
            >
              {ABOUT_HERO.title}
            </motion.h1>

            <motion.p
              className="about-hero-desc"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...heroTitleTransition, delay: 0.22 }}
            >
              {ABOUT_HERO.description}
            </motion.p>

            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={heroActionsTransition}
            >
              <PrimaryButton href={LANDING_LINKS.studio}>{ABOUT_CTA.button}</PrimaryButton>
            </motion.div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="about-why-title" className="about-why">
        <Container>
          <div className="about-why-grid">
            <ScrollReveal>
              <div className="about-why-copy">
                <h2 id="about-why-title">{ABOUT_WHY.title}</h2>
                {ABOUT_WHY.paragraphs.map((paragraph, index) => (
                  <p key={paragraph} className={index === 1 ? 'about-why-emphasis' : undefined}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={scrollRevealDelay(2)}>
              <figure className="about-why-visual">
                <div className="about-why-frame" aria-hidden="true">
                  <span className="about-why-frame-glow" />
                </div>
                <img
                  src={Assets.occasions.proposal}
                  alt={ABOUT_WHY.imageAlt}
                  loading="lazy"
                  decoding="async"
                  className="about-why-image"
                />
              </figure>
            </ScrollReveal>
          </div>
        </Container>
      </section>

      <section aria-labelledby="about-vision-title" className="about-vision">
        <Container>
          <ScrollReveal>
            <SectionHead
              eyebrow="The future"
              title="Our Vision"
              centered
              titleId="about-vision-title"
            />
          </ScrollReveal>

          <div className="landing-feature-grid about-vision-grid">
            {ABOUT_VISION_CARDS.map((card, index) => (
              <ScrollReveal key={card.title} delay={scrollRevealDelay(index + 1)}>
                <article className="landing-f-card about-vision-card">
                  <span className="about-vision-index" aria-hidden="true">
                    0{index + 1}
                  </span>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </section>

      <section aria-labelledby="about-how-title" className="about-how">
        <Container className="about-how-wrap">
          <ScrollReveal>
            <SectionHead
              eyebrow="The journey"
              title="How Chronivs Works"
              centered
              className="landing-how-head"
              titleId="about-how-title"
            />
          </ScrollReveal>

          <ol className="about-timeline" aria-labelledby="about-how-title">
            {ABOUT_TIMELINE.map((item, index) => (
              <li key={item.step}>
                <ScrollReveal delay={scrollRevealDelay(index + 1)}>
                  <div className="about-timeline-step">
                    <div className="about-timeline-node">{item.step}</div>
                    <h3>{item.title}</h3>
                    {index < ABOUT_TIMELINE.length - 1 ? (
                      <span className="about-timeline-arrow" aria-hidden="true">
                        ↓
                      </span>
                    ) : null}
                  </div>
                </ScrollReveal>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section aria-labelledby="about-values-title" className="about-values">
        <Container>
          <ScrollReveal>
            <SectionHead
              eyebrow="What we stand for"
              title="Core Values"
              centered
              titleId="about-values-title"
            />
          </ScrollReveal>

          <ul className="about-values-grid">
            {ABOUT_VALUES.map((value, index) => (
              <li key={value.title}>
                <ScrollReveal delay={scrollRevealDelay(index + 1)}>
                  <article className="about-value-card">
                    <h3>{value.title}</h3>
                    <p>{value.description}</p>
                  </article>
                </ScrollReveal>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="about-cta-title" className="landing-cta about-cta">
        <div className="landing-cta-glow" aria-hidden="true" />
        <Container>
          <ScrollReveal>
            <h2 id="about-cta-title">
              Let&apos;s create something <em>unforgettable.</em>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={scrollRevealDelay(2)}>
            <PrimaryButton href={LANDING_LINKS.studio}>{ABOUT_CTA.button}</PrimaryButton>
          </ScrollReveal>
        </Container>
      </section>
    </div>
  );
}
