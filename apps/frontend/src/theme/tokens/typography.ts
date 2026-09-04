export const typography = {
  fontFamily: {
    sans: 'var(--font-sans)',
    display: 'var(--font-display)',
    mono: 'var(--font-mono)',
  },
  fontSize: {
    xs: 'var(--text-xs)',
    sm: 'var(--text-sm)',
    base: 'var(--text-base)',
    lg: 'var(--text-lg)',
    xl: 'var(--text-xl)',
    '2xl': 'var(--text-2xl)',
    '3xl': 'var(--text-3xl)',
    '4xl': 'var(--text-4xl)',
    '5xl': 'var(--text-5xl)',
    '6xl': 'var(--text-6xl)',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: 'var(--leading-tight)',
    snug: 'var(--leading-snug)',
    normal: 'var(--leading-normal)',
    relaxed: 'var(--leading-relaxed)',
  },
  letterSpacing: {
    tight: 'var(--tracking-tight)',
    normal: 'var(--tracking-normal)',
    wide: 'var(--tracking-wide)',
  },
} as const;

export type TypographyToken = typeof typography;
