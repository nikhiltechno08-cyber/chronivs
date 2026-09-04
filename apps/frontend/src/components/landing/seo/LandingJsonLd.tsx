import { landingJsonLd } from './metadata';

export function LandingJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(landingJsonLd) }}
    />
  );
}
