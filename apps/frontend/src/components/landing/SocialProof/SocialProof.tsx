'use client';

import { PRESS_LOGOS, SOCIAL_PROOF_STATS } from '@/components/landing/data';
import { Container } from '@/components/landing/shared/Container';
import { Eyebrow } from '@/components/landing/shared/Eyebrow';
import { ScrollReveal, scrollRevealDelay } from '@/components/landing/shared/ScrollReveal';

import { StatCounter } from './StatCounter';

export function SocialProof() {
  return (
    <section aria-label="Social proof" className="landing-trust">
      <Container>
        <ScrollReveal>
          <Eyebrow centered>Trusted worldwide</Eyebrow>
        </ScrollReveal>

        <div className="landing-stat-row">
          {SOCIAL_PROOF_STATS.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={scrollRevealDelay(i + 1)} className="landing-stat">
              <StatCounter stat={stat} />
              <div className="lbl">{stat.label}</div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={scrollRevealDelay(4)} className="landing-press-row">
          {PRESS_LOGOS.map((name) => (
            <span key={name}>{name}</span>
          ))}
        </ScrollReveal>
      </Container>
    </section>
  );
}
