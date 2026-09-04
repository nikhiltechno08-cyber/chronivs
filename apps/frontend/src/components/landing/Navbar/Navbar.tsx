'use client';

import Link from 'next/link';
import { useState } from 'react';

import { LANDING_LINKS, NAV_LINKS } from '@/components/landing/data';
import { useNavScrolled } from '@/components/landing/hooks';

import { NavbarMobileDrawer } from './NavbarMobileDrawer';

export function Navbar() {
  const scrolled = useNavScrolled();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="landing-nav-shell">
        <nav aria-label="Main navigation" className={`landing-nav ${scrolled ? 'is-scrolled' : ''}`}>
          <Link href={LANDING_LINKS.home} className="landing-nav-logo">
            Chronivs
          </Link>

          <div className="landing-nav-links">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>

          <Link href={LANDING_LINKS.studio} className="landing-nav-cta">
            Create Experience
          </Link>

          <button
            type="button"
            className={`landing-nav-burger ${mobileOpen ? 'is-open' : ''}`}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </nav>
      </header>

      <NavbarMobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
