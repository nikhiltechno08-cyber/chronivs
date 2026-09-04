/** Chronivs spacing scale (px) */

export const spacing = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
} as const;

export const spacingVar = {
  1: 'var(--chronivs-space-1)',
  2: 'var(--chronivs-space-2)',
  3: 'var(--chronivs-space-3)',
  4: 'var(--chronivs-space-4)',
  5: 'var(--chronivs-space-5)',
  6: 'var(--chronivs-space-6)',
  8: 'var(--chronivs-space-8)',
  10: 'var(--chronivs-space-10)',
  12: 'var(--chronivs-space-12)',
  16: 'var(--chronivs-space-16)',
  20: 'var(--chronivs-space-20)',
} as const;

export type SpacingToken = typeof spacing;
