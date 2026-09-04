export const colors = {
  brand: {
    50: 'var(--color-brand-50)',
    100: 'var(--color-brand-100)',
    200: 'var(--color-brand-200)',
    300: 'var(--color-brand-300)',
    400: 'var(--color-brand-400)',
    500: 'var(--color-brand-500)',
    600: 'var(--color-brand-600)',
    700: 'var(--color-brand-700)',
    800: 'var(--color-brand-800)',
    900: 'var(--color-brand-900)',
    950: 'var(--color-brand-950)',
  },
  background: {
    primary: 'var(--color-bg-primary)',
    secondary: 'var(--color-bg-secondary)',
    tertiary: 'var(--color-bg-tertiary)',
    inverse: 'var(--color-bg-inverse)',
  },
  foreground: {
    primary: 'var(--color-fg-primary)',
    secondary: 'var(--color-fg-secondary)',
    muted: 'var(--color-fg-muted)',
    inverse: 'var(--color-fg-inverse)',
  },
  border: {
    default: 'var(--color-border-default)',
    subtle: 'var(--color-border-subtle)',
    strong: 'var(--color-border-strong)',
  },
  status: {
    success: 'var(--color-status-success)',
    warning: 'var(--color-status-warning)',
    error: 'var(--color-status-error)',
    info: 'var(--color-status-info)',
  },
} as const;

export type ColorToken = typeof colors;
