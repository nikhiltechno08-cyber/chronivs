'use client';

import { memo } from 'react';

import { OCCASION_IMAGE_BY_ID, type LandingOccasionId } from '@/config/assets';
import { OCCASIONS } from '@/components/landing/data';
import { Container } from '@/components/landing/shared/Container';
import { ScrollReveal, scrollRevealDelay } from '@/components/landing/shared/ScrollReveal';
import { SectionHead } from '@/components/landing/shared/SectionHead';

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 018 0v4" />
    </svg>
  );
}

function OccasionCard({
  occasion,
  index,
}: {
  occasion: (typeof OCCASIONS)[number];
  index: number;
}) {
  return (
    <ScrollReveal delay={scrollRevealDelay((index % 3) + 1)}>
      <article className={`landing-t-card ${occasion.locked ? 'is-locked' : ''}`}>
        <div
          className={`art landing-${occasion.art}`}
          style={{ backgroundImage: `url(${OCCASION_IMAGE_BY_ID[occasion.id as LandingOccasionId]})` }}
          aria-hidden="true"
        />
        <div className="grain-overlay" aria-hidden="true" />

        {occasion.locked && (
          <>
            <div className="landing-lock-badge">
              <LockIcon />
            </div>
            <span className="landing-soon-tag">Coming soon</span>
          </>
        )}

        <div className="meta">
          <div className="cat">{occasion.category}</div>
          <div className="name">{occasion.name}</div>
        </div>
      </article>
    </ScrollReveal>
  );
}

function OccasionShowcaseComponent() {
  return (
    <section id="templates" aria-label="Occasion templates" className="landing-templates">
      <Container>
        <ScrollReveal>
          <SectionHead
            eyebrow="The collection"
            title="Designed For Every Occasion"
            description="Choose a beautiful experience. Personalize it. Share unforgettable memories."
            centered
          />
        </ScrollReveal>

        <div className="landing-card-grid">
          {OCCASIONS.map((occasion, i) => (
            <OccasionCard key={occasion.id} occasion={occasion} index={i} />
          ))}
        </div>
      </Container>
    </section>
  );
}

export const OccasionShowcase = memo(OccasionShowcaseComponent);
