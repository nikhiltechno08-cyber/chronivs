export type LegalSection = {
  id: string;
  number: string;
  title: string;
  intro?: string;
  paragraphs?: string[];
  items?: string[];
  highlights?: { title: string; description: string }[];
  relatedLink?: { href: string; label: string };
};

export type LegalPageHero = {
  eyebrow: string;
  title: string;
  description: string;
  lastUpdated?: string;
};

export type LegalPageCta = {
  title: string;
  button: string;
  href: string;
};

export type LegalPageProps = {
  pageClassName?: string;
  hero: LegalPageHero;
  sections: LegalSection[];
  cta: LegalPageCta;
  contentAriaLabel: string;
  heroTitleId: string;
  ctaTitleId: string;
};
