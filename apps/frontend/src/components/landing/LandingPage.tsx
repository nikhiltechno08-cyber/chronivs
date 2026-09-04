'use client';

import dynamic from 'next/dynamic';

import { AmbientBackground } from './shared/AmbientBackground';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { SocialProof } from './SocialProof';
import { Cta } from './Cta';
import { Footer } from './Footer';
import { LandingJsonLd } from './seo/LandingJsonLd';

import './landing.css';

const OccasionShowcase = dynamic(
  () => import('./OccasionShowcase').then((m) => ({ default: m.OccasionShowcase })),
  { ssr: true },
);

const HowItWorks = dynamic(
  () => import('./HowItWorks').then((m) => ({ default: m.HowItWorks })),
  { ssr: true },
);

const Features = dynamic(
  () => import('./Features').then((m) => ({ default: m.Features })),
  { ssr: true },
);

const Testimonials = dynamic(
  () => import('./Testimonials').then((m) => ({ default: m.Testimonials })),
  { ssr: true },
);

export function LandingPage() {
  return (
    <div className="landing-page relative">
      <LandingJsonLd />
      <AmbientBackground />
      <div className="landing-grain" aria-hidden="true" />
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <OccasionShowcase />
        <HowItWorks />
        <Features />
        <Testimonials />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
