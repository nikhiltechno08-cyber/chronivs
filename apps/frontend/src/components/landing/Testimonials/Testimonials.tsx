'use client';

import { memo } from 'react';

import { TESTIMONIALS } from '@/components/landing/data';
import { Container } from '@/components/landing/shared/Container';
import { ScrollReveal, scrollRevealDelay } from '@/components/landing/shared/ScrollReveal';
import { SectionHead } from '@/components/landing/shared/SectionHead';

function TestimonialsComponent() {
  return (
    <section id="reviews" aria-label="Testimonials" className="landing-testimonials">
      <Container>
        <ScrollReveal>
          <SectionHead
            eyebrow="In their words"
            title="Loved By People Who Love Deeply"
            centered
            className="landing-testimonials-head"
          />
        </ScrollReveal>

        <div className="landing-quote-grid">
          {TESTIMONIALS.map((item, i) => (
            <ScrollReveal key={item.name} delay={scrollRevealDelay(i + 1)}>
              <blockquote className="landing-q-card">
                <div className="mark" aria-hidden="true">
                  &ldquo;
                </div>
                <p>{item.quote}</p>
                <footer className="who">
                  <div className="avatar" aria-hidden="true" />
                  <div>
                    <cite className="name">{item.name}</cite>
                    <div className="occ">{item.occasion}</div>
                  </div>
                </footer>
              </blockquote>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

export const Testimonials = memo(TestimonialsComponent);
