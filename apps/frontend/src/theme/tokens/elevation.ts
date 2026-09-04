export const elevation = {
  0: 'var(--elevation-0)',
  1: 'var(--elevation-1)',
  2: 'var(--elevation-2)',
  3: 'var(--elevation-3)',
  4: 'var(--elevation-4)',
  5: 'var(--elevation-5)',
} as const;

export type ElevationToken = typeof elevation;
