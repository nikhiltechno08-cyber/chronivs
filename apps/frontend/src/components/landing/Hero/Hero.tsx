'use client';

import { motion } from 'framer-motion';
import { useState, type CSSProperties } from 'react';

import { Assets } from '@/config/assets';

import { HERO_CONTENT, LANDING_LINKS } from '@/components/landing/data';
import { Container } from '@/components/landing/shared/Container';
import { Eyebrow } from '@/components/landing/shared/Eyebrow';
import { GlassButton, PlayIcon } from '@/components/landing/shared/GlassButton';
import { PrimaryButton } from '@/components/landing/shared/PrimaryButton';
import { useReducedMotion } from '@/animations/hooks/use-reduced-motion';

import {
  HERO_ENTRANCE_DELAYS,
  heroActionsTransition,
  heroFadeTransition,
  heroTitleTransition,
} from './HeroAnimations';
import { DemoVideoModal } from './DemoVideoModal';
import { HeroGlassGlow } from './HeroGlassGlow';
import { HeroParticles } from './HeroParticles';
import './hero-glass-glow.css';
import './hero-particles.css';

export function HeroBackground() {
  return (
    <>
      <div
        className="landing-hero-glow"
        aria-hidden="true"
        style={
          {
            '--landing-hero-background-image': `url("${Assets.hero.background}")`,
          } as CSSProperties
        }
      />
      <HeroParticles />
      <HeroGlassGlow />
    </>
  );
}

export function HeroContent({ onWatchDemo }: { onWatchDemo: () => void }) {
  const lines = HERO_CONTENT.lines;
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="landing-hero-left">
      <Eyebrow className="landing-hero-eyebrow">{HERO_CONTENT.eyebrow}</Eyebrow>

      <motion.h1
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={heroTitleTransition}
      >
        {lines.map((line, i) => (
          <span key={line} className="line">
            {i === 1 ? (
              <>
                <em>A Memory</em> They&apos;ll Never
              </>
            ) : (
              line
            )}
          </span>
        ))}
      </motion.h1>

      <p className="sub">{HERO_CONTENT.sub}</p>

      <motion.div
        className="landing-hero-actions"
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={heroActionsTransition}
      >
        <PrimaryButton href={LANDING_LINKS.studio}>Create Experience</PrimaryButton>
        <GlassButton onClick={onWatchDemo} icon={<PlayIcon />}>
          Watch Demo
        </GlassButton>
      </motion.div>
    </div>
  );
}

export function HeroScrollCue() {
  return (
    <motion.div
      className="landing-hero-scroll-cue"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ ...heroFadeTransition, delay: HERO_ENTRANCE_DELAYS.scrollCue }}
      aria-hidden="true"
    >
      <span>Scroll</span>
      <div className="stick">
        <i />
      </div>
    </motion.div>
  );
}

export function Hero() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <>
      <section id="home" aria-label="Hero" className="landing-hero">
        <HeroBackground />
        <Container className="landing-hero-grid">
          <HeroContent onWatchDemo={() => setDemoOpen(true)} />
        </Container>
        <HeroScrollCue />
      </section>
      <DemoVideoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </>
  );
}
