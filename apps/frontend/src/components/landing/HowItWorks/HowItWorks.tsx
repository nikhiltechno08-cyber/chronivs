'use client';

import { memo } from 'react';

import { HOW_IT_WORKS_STEPS } from '@/components/landing/data';
import { Container } from '@/components/landing/shared/Container';
import { ScrollReveal, scrollRevealDelay } from '@/components/landing/shared/ScrollReveal';
import { SectionHead } from '@/components/landing/shared/SectionHead';

function HowItWorksComponent() {
  return (
    <section id="how" aria-label="How it works" className="landing-how">
      <Container className="landing-how-wrap">
        <ScrollReveal>
          <SectionHead eyebrow="The process" title="How It Works" centered className="landing-how-head" />
        </ScrollReveal>

        <ol className="landing-timeline">
          {HOW_IT_WORKS_STEPS.map((step, i) => (
            <li key={step.step}>
              <ScrollReveal delay={scrollRevealDelay(i + 1)}>
                <div className="landing-t-step">
                  <div className="node">{step.step}</div>
                  <div className="content">
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

export const HowItWorks = memo(HowItWorksComponent);
