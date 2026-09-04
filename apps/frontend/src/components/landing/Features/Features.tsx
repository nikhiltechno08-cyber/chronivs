'use client';

import { memo } from 'react';

import { FEATURES } from '@/components/landing/data';
import { Container } from '@/components/landing/shared/Container';
import { ScrollReveal, scrollRevealDelay } from '@/components/landing/shared/ScrollReveal';
import { SectionHead } from '@/components/landing/shared/SectionHead';

import { FeatureIcon } from './FeatureIcon';

function FeaturesComponent() {
  return (
    <section aria-label="Features" className="landing-why">
      <Container>
        <ScrollReveal>
          <SectionHead eyebrow="The difference" title="Why Chronivs" centered className="landing-why-head" />
        </ScrollReveal>

        <div className="landing-feature-grid">
          {FEATURES.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={scrollRevealDelay(i + 1)}>
              <article className="landing-f-card">
                <FeatureIcon type={feature.icon} />
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

export const Features = memo(FeaturesComponent);
