import Link from 'next/link';

import { type LegalSection } from './types';

type LegalSectionCardProps = {
  section: LegalSection;
};

export function LegalSectionCard({ section }: LegalSectionCardProps) {
  return (
    <article className="legal-section-card" id={section.id}>
      <div className="legal-section-card-head">
        <span className="legal-section-number" aria-hidden="true">
          {section.number}
        </span>
        <h2>{section.title}</h2>
      </div>

      {section.intro ? <p className="legal-section-intro">{section.intro}</p> : null}

      {section.paragraphs?.map((paragraph, index) => (
        <p key={`${section.id}-p-${index}`} className="legal-section-copy">
          {paragraph}
        </p>
      ))}

      {section.items ? (
        <ul className="legal-section-list">
          {section.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}

      {section.highlights ? (
        <div className="legal-section-highlights">
          {section.highlights.map((highlight) => (
            <div key={highlight.title} className="legal-highlight">
              <h3>{highlight.title}</h3>
              <p>{highlight.description}</p>
            </div>
          ))}
        </div>
      ) : null}

      {section.relatedLink ? (
        <p className="legal-section-link-wrap">
          <Link href={section.relatedLink.href} className="legal-section-link">
            {section.relatedLink.label}
          </Link>
        </p>
      ) : null}
    </article>
  );
}
