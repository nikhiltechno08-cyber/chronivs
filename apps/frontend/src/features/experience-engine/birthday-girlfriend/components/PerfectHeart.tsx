'use client';

import { memo } from 'react';

/** Classic symmetrical heart (viewBox 0 0 24 24). */
export const HEART_PATH =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

type PerfectHeartProps = {
  className?: string;
  title?: string;
};

export const PerfectHeart = memo(function PerfectHeart({ className, title }: PerfectHeartProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path d={HEART_PATH} />
    </svg>
  );
});

/** Heart outline for constellation / forever scene (centered in 400×300). */
export const FOREVER_HEART_PATH =
  'M200 92 C176 58 138 52 114 76 C88 102 92 148 140 190 C164 210 186 232 200 252 C214 232 236 210 260 190 C308 148 312 102 286 76 C262 52 224 58 200 92 Z';
