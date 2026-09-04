'use client';

import type { AdminAnalyticsCountItem } from '../types';

type RankedListCardProps = {
  title: string;
  description?: string;
  items: AdminAnalyticsCountItem[];
  emptyLabel?: string;
};

export function RankedListCard({
  title,
  description,
  items,
  emptyLabel = 'No purchases recorded yet.',
}: RankedListCardProps) {
  const maxCount = Math.max(...items.map((item) => item.count), 0);

  return (
    <article className="admin-analytics-ranked-card">
      <div className="admin-analytics-chart-card-header">
        <div>
          <h3>{title}</h3>
          {description ? <p>{description}</p> : null}
        </div>
      </div>

      {items.length === 0 || maxCount === 0 ? (
        <div className="admin-analytics-chart-empty">
          <p>{emptyLabel}</p>
        </div>
      ) : (
        <ul className="admin-analytics-ranked-list">
          {items.map((item, index) => {
            const width = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
            return (
              <li key={`${item.key}-${index}`}>
                <div className="admin-analytics-ranked-row">
                  <span className="admin-analytics-ranked-label">{item.label}</span>
                  <span className="admin-analytics-ranked-count">
                    {new Intl.NumberFormat('en-IN').format(item.count)}
                  </span>
                </div>
                <div className="admin-analytics-ranked-track" aria-hidden="true">
                  <span style={{ width: `${width}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}
