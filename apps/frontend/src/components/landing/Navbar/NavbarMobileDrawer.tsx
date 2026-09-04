'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { LANDING_LINKS, NAV_LINKS } from '@/components/landing/data';

type NavbarMobileDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function NavbarMobileDrawer({ open, onClose }: NavbarMobileDrawerProps) {
  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <div
      {...(open
        ? { role: 'dialog' as const, 'aria-modal': true, 'aria-label': 'Mobile navigation' }
        : { 'aria-hidden': true })}
      inert={!open ? true : undefined}
      className={`landing-mobile-drawer ${open ? 'is-open' : ''}`}
    >
      <nav className="landing-mobile-drawer-inner" aria-label="Mobile menu">
        <ul className="landing-mobile-drawer-links">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} onClick={onClose}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="landing-mobile-drawer-cta">
          <Link href={LANDING_LINKS.studio} className="landing-nav-cta" onClick={onClose}>
            Create Experience
          </Link>
        </div>
      </nav>
    </div>
  );
}
