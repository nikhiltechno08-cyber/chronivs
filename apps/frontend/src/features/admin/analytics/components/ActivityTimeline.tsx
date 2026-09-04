'use client';

import { CreditCard, ShoppingBag, Sparkles } from 'lucide-react';

import type { AdminAnalyticsActivityItem, AdminAnalyticsActivityType } from '../types';

type ActivityTimelineProps = {
  items: AdminAnalyticsActivityItem[];
};

const ICONS: Record<AdminAnalyticsActivityType, typeof CreditCard> = {
  payment_completed: CreditCard,
  experience_generated: Sparkles,
  customer_purchased: ShoppingBag,
};

function formatWhen(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function ActivityTimeline({ items }: ActivityTimelineProps) {
  if (items.length === 0) {
    return (
      <div className="admin-analytics-chart-empty">
        <p>No recent activity yet.</p>
      </div>
    );
  }

  return (
    <ol className="admin-analytics-timeline">
      {items.map((item) => {
        const Icon = ICONS[item.type] ?? CreditCard;
        return (
          <li key={item.id} className="admin-analytics-timeline-item">
            <span className="admin-analytics-timeline-icon" aria-hidden="true">
              <Icon />
            </span>
            <div className="admin-analytics-timeline-copy">
              <p className="admin-analytics-timeline-title">{item.title}</p>
              <p className="admin-analytics-timeline-subtitle">{item.subtitle}</p>
            </div>
            <time className="admin-analytics-timeline-time" dateTime={item.occurredAt}>
              {formatWhen(item.occurredAt)}
            </time>
          </li>
        );
      })}
    </ol>
  );
}
