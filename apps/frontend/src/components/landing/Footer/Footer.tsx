import Link from 'next/link';

import {
  FOOTER_BRAND,
  FOOTER_LINKS,
  FOOTER_SOCIAL_LINKS,
  SITE_ROUTES,
} from '@/components/landing/data';
import { Container } from '@/components/landing/shared/Container';

export function Footer() {
  return (
    <footer className="landing-footer">
      <Container>
        <div className="landing-footer-grid">
          <div className="landing-footer-brand">
            <Link href={SITE_ROUTES.home} className="landing-nav-logo">
              Chronivs
            </Link>
            <p>{FOOTER_BRAND.description}</p>
            <div className="landing-social-row">
              {FOOTER_SOCIAL_LINKS.map((social) => (
                <Link key={social.label} href={social.href} aria-label={social.label}>
                  {social.abbr}
                </Link>
              ))}
            </div>
          </div>

          <div className="landing-footer-col">
            <h4>Product</h4>
            {FOOTER_LINKS.product.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="landing-footer-col">
            <h4>Company</h4>
            {FOOTER_LINKS.company.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="landing-footer-col">
            <h4>Legal</h4>
            {FOOTER_LINKS.legal.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="landing-footer-bottom">
          <span>© 2026 Chronivs. All rights reserved.</span>
          <span>Made for moments that matter.</span>
        </div>
      </Container>
    </footer>
  );
}
