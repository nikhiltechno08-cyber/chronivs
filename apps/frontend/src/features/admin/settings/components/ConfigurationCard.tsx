import { cn } from '@chronivs/ui';

import type { ConfigurationCardData } from '../types';
import { HealthBadge } from './HealthBadge';

type ConfigurationCardProps = {
  card: ConfigurationCardData;
};

export function ConfigurationCard({ card }: ConfigurationCardProps) {
  return (
    <article className="admin-settings-config-card">
      <div className="admin-settings-config-card-header">
        <h3>{card.title}</h3>
        {card.description ? <p>{card.description}</p> : null}
      </div>

      <dl className="admin-settings-config-list">
        {card.fields.map((field) => (
          <div
            key={`${card.id}-${field.label}`}
            className={cn('admin-settings-config-row', field.placeholder && 'is-placeholder')}
          >
            <dt>{field.label}</dt>
            <dd>
              {field.status ? (
                <HealthBadge status={field.status} label={field.value} />
              ) : (
                <span>{field.value}</span>
              )}
              {field.placeholder ? <span className="admin-settings-future-tag">Coming soon</span> : null}
            </dd>
          </div>
        ))}
      </dl>

      {card.futureFeatures && card.futureFeatures.length > 0 ? (
        <div className="admin-settings-future-list">
          <p>Future</p>
          <ul>
            {card.futureFeatures.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}
