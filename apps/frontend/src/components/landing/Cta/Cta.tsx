'use client';

import { LANDING_LINKS } from '@/components/landing/data';
import { Container } from '@/components/landing/shared/Container';
import { PrimaryButton } from '@/components/landing/shared/PrimaryButton';
import { ScrollReveal, scrollRevealDelay } from '@/components/landing/shared/ScrollReveal';

export function Cta() {
  return (
    <section id="contact" aria-label="Call to action" className="landing-cta">
      <div className="landing-cta-glow" aria-hidden="true" />
      <Container>
        <ScrollReveal>
          <h2>
            Ready To Create Something <em>They&apos;ll Never Forget?</em>
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={scrollRevealDelay(2)}>
          <PrimaryButton href={LANDING_LINKS.studio}>Create Experience</PrimaryButton>
        </ScrollReveal>
      </Container>
    </section>
  );
}
