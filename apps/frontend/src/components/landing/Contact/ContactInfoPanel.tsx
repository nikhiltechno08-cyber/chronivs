import Link from 'next/link';

import { CONTACT_INFO } from './contact-content';

export function ContactInfoPanel() {
  return (
    <aside className="contact-info" aria-label="Contact information">
      <p className="contact-info-intro">
        Reach our team directly. We respond to every message with care.
      </p>

      <dl className="contact-info-list">
        {CONTACT_INFO.map((item) => (
          <div key={item.id} className="contact-info-item">
            <dt>{item.label}</dt>
            <dd>
              {'href' in item && item.href ? (
                <Link
                  href={item.href}
                  {...(item.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {item.value}
                </Link>
              ) : (
                item.value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
