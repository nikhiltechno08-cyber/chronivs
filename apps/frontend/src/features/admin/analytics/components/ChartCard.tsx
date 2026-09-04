'use client';

import type { AdminAnalyticsTrendPoint } from '../types';

type ChartCardProps = {
  title: string;
  description?: string;
  data: AdminAnalyticsTrendPoint[];
  variant?: 'area' | 'line' | 'bar';
  valueFormatter?: (value: number) => string;
  emptyLabel?: string;
};

const CHART_WIDTH = 640;
const CHART_HEIGHT = 220;
const PADDING = 24;

function buildPoints(values: number[], maxValue: number) {
  if (values.length === 0) {
    return '';
  }
  const step = values.length > 1 ? (CHART_WIDTH - PADDING * 2) / (values.length - 1) : 0;
  return values
    .map((value, index) => {
      const x = PADDING + index * step;
      const ratio = maxValue > 0 ? value / maxValue : 0;
      const y = CHART_HEIGHT - PADDING - ratio * (CHART_HEIGHT - PADDING * 2);
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

function buildAreaPath(values: number[], maxValue: number) {
  if (values.length === 0) {
    return '';
  }
  const line = buildPoints(values, maxValue);
  const step = values.length > 1 ? (CHART_WIDTH - PADDING * 2) / (values.length - 1) : 0;
  const lastX = PADDING + (values.length - 1) * step;
  const baseY = CHART_HEIGHT - PADDING;
  return `${line} L ${lastX.toFixed(2)} ${baseY} L ${PADDING} ${baseY} Z`;
}

function hasAnyValue(data: AdminAnalyticsTrendPoint[]): boolean {
  return data.some((point) => point.value > 0);
}

export function ChartCard({
  title,
  description,
  data,
  variant = 'area',
  valueFormatter = (value) => String(value),
  emptyLabel = 'No data in this period.',
}: ChartCardProps) {
  const values = data.map((point) => point.value);
  const maxValue = Math.max(...values, 0);
  const showChart = data.length > 0 && hasAnyValue(data);
  const latest = data.at(-1)?.value ?? 0;

  return (
    <article className="admin-analytics-chart-card">
      <div className="admin-analytics-chart-card-header">
        <div>
          <h3>{title}</h3>
          {description ? <p>{description}</p> : null}
        </div>
        <div className="admin-analytics-chart-card-meta">
          <span>Latest</span>
          <strong>{valueFormatter(latest)}</strong>
        </div>
      </div>

      {showChart ? (
        <div className="admin-analytics-chart-shell">
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            role="img"
            aria-label={`${title} chart`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id={`chart-gradient-${title.replace(/\s+/g, '-')}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(205, 164, 94, 0.34)" />
                <stop offset="100%" stopColor="rgba(205, 164, 94, 0.02)" />
              </linearGradient>
            </defs>

            {[0.25, 0.5, 0.75].map((ratio) => {
              const y = PADDING + ratio * (CHART_HEIGHT - PADDING * 2);
              return (
                <line
                  key={ratio}
                  x1={PADDING}
                  x2={CHART_WIDTH - PADDING}
                  y1={y}
                  y2={y}
                  className="admin-analytics-chart-gridline"
                />
              );
            })}

            {variant === 'bar'
              ? values.map((value, index) => {
                  const barWidth =
                    values.length > 0 ? (CHART_WIDTH - PADDING * 2) / values.length - 6 : 0;
                  const x =
                    PADDING + index * ((CHART_WIDTH - PADDING * 2) / Math.max(values.length, 1)) + 3;
                  const height =
                    maxValue > 0 ? (value / maxValue) * (CHART_HEIGHT - PADDING * 2) : 0;
                  const y = CHART_HEIGHT - PADDING - height;
                  return (
                    <rect
                      key={`${title}-bar-${index}`}
                      x={x}
                      y={y}
                      width={Math.max(barWidth, 4)}
                      height={height}
                      rx="4"
                      className="admin-analytics-chart-bar"
                    />
                  );
                })
              : null}

            {variant === 'area' ? (
              <path
                d={buildAreaPath(values, maxValue)}
                fill={`url(#chart-gradient-${title.replace(/\s+/g, '-')})`}
              />
            ) : null}

            {variant !== 'bar' ? (
              <path d={buildPoints(values, maxValue)} className="admin-analytics-chart-line" fill="none" />
            ) : null}
          </svg>
        </div>
      ) : (
        <div className="admin-analytics-chart-empty">
          <p>{emptyLabel}</p>
        </div>
      )}
    </article>
  );
}
