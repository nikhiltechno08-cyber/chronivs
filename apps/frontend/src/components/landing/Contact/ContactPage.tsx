'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { type CSSProperties } from 'react';

import { useReducedMotion } from '@/animations/hooks/use-reduced-motion';
import { Assets } from '@/config/assets';
import { AboutParticles } from '@/components/landing/About/AboutParticles';
import { Container } from '@/components/landing/shared/Container';
import { Eyebrow } from '@/components/landing/shared/Eyebrow';
import { PrimaryButton } from '@/components/landing/shared/PrimaryButton';
import { ScrollReveal, scrollRevealDelay } from '@/components/landing/shared/ScrollReveal';

import { ContactForm } from './ContactForm';
import { ContactInfoPanel } from './ContactInfoPanel';
import { CONTACT_CTA, CONTACT_FAQ_LINKS, CONTACT_HERO } from './contact-content';

import '@/components/landing/Hero/hero-particles.css';
import './contact.css';

const heroTitleTransition = {
  duration: 1,
  delay: 0.12,
  ease: [0.22, 0.61, 0.36, 1] as const,
};

export function ContactPage() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="contact-page">
      <section aria-labelledby="contact-hero-title" className="contact-hero">
        <div
          className="contact-hero-glow"
          aria-hidden="true"
          style={
            {
              '--landing-hero-background-image': `url("${Assets.hero.background}")`,
            } as CSSProperties
          }
        />
        <AboutParticles />

        <Container>
          <div className="contact-hero-inner">
            <Eyebrow className="contact-hero-eyebrow">{CONTACT_HERO.eyebrow}</Eyebrow>

            <motion.h1
              id="contact-hero-title"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={heroTitleTransition}
            >
              {CONTACT_HERO.title}
            </motion.h1>

            <motion.p
              className="contact-hero-desc"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...heroTitleTransition, delay: 0.22 }}
            >
              {CONTACT_HERO.description}
            </motion.p>
          </div>
        </Container>
      </section>

      <section aria-label="Contact form and information" className="contact-main">
        <Container>
          <div className="contact-grid">
            <ScrollReveal>
              <div className="contact-form-panel">
                <h2 className="contact-panel-title">Send us a message</h2>
                <ContactForm />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={scrollRevealDelay(2)}>
              <ContactInfoPanel />
            </ScrollReveal>
          </div>
        </Container>
      </section>

      <section aria-labelledby="contact-faq-links-title" className="contact-quick-links">
        <Container>
          <ScrollReveal>
            <h2 id="contact-faq-links-title" className="contact-quick-links-title">
              FAQ Quick Links
            </h2>
          </ScrollReveal>

          <ul className="contact-quick-links-grid">
            {CONTACT_FAQ_LINKS.map((link, index) => (
              <li key={link.id}>
                <ScrollReveal delay={scrollRevealDelay(index + 1)}>
                  <Link href={link.href} className="contact-quick-link">
                    <span>{link.label}</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </ScrollReveal>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="contact-cta-title" className="landing-cta contact-cta">
        <div className="landing-cta-glow" aria-hidden="true" />
        <Container>
          <ScrollReveal>
            <h2 id="contact-cta-title">{CONTACT_CTA.title}</h2>
          </ScrollReveal>
          <ScrollReveal delay={scrollRevealDelay(2)}>
            <PrimaryButton href={CONTACT_CTA.href}>{CONTACT_CTA.title}</PrimaryButton>
          </ScrollReveal>
        </Container>
      </section>
    </div>
  );
}
