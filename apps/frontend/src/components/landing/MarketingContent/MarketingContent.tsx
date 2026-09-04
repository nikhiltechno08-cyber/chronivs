import { type ReactNode } from 'react';

import { Container } from '@/components/landing/shared/Container';

export type MarketingSection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
  faqs?: { question: string; answer: string }[];
  children?: ReactNode;
};

type MarketingContentProps = {
  title: string;
  subtitle?: string;
  sections: MarketingSection[];
};

export function MarketingContent({ title, subtitle, sections }: MarketingContentProps) {
  return (
    <article className="landing-marketing">
      <Container>
        <header className="landing-marketing-header">
          <p className="landing-marketing-eyebrow">Chronivs</p>
          <h1>{title}</h1>
          {subtitle ? <p className="landing-marketing-subtitle">{subtitle}</p> : null}
        </header>

        <div className="landing-marketing-body">
          {sections.map((section) => (
            <section key={section.title} className="landing-marketing-section">
              <h2>{section.title}</h2>
              {section.paragraphs?.map((paragraph, index) => (
                <p key={`${section.title}-p-${index}`}>{paragraph}</p>
              ))}
              {section.items ? (
                <ul>
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {section.faqs ? (
                <div className="landing-marketing-faqs">
                  {section.faqs.map((faq) => (
                    <div key={faq.question} className="landing-marketing-faq">
                      <h3>{faq.question}</h3>
                      <p>{faq.answer}</p>
                    </div>
                  ))}
                </div>
              ) : null}
              {section.children}
            </section>
          ))}
        </div>
      </Container>
    </article>
  );
}
