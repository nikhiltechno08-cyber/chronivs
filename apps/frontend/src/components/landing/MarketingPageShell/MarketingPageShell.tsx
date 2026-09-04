'use client';

import { type ReactNode } from 'react';

import { AmbientBackground } from '@/components/landing/shared/AmbientBackground';
import { Footer } from '@/components/landing/Footer';
import { Navbar } from '@/components/landing/Navbar';

import '@/components/landing/landing.css';

type MarketingPageShellProps = {
  children: ReactNode;
};

export function MarketingPageShell({ children }: MarketingPageShellProps) {
  return (
    <div className="landing-page relative">
      <AmbientBackground />
      <div className="landing-grain" aria-hidden="true" />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
