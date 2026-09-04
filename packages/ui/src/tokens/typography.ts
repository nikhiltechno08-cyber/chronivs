/** Chronivs typography scale — matches landing hierarchy */

export const fontFamily = {
  sans: 'var(--font-sans)',
  display: 'var(--font-display)',
  mono: 'var(--font-mono)',
} as const;

export const fontSize = {
  heroXl: 'var(--chronivs-text-hero-xl)',
  heroL: 'var(--chronivs-text-hero-l)',
  heading: 'var(--chronivs-text-heading)',
  subHeading: 'var(--chronivs-text-subheading)',
  body: 'var(--chronivs-text-body)',
  bodySm: 'var(--chronivs-text-body-sm)',
  caption: 'var(--chronivs-text-caption)',
  button: 'var(--chronivs-text-button)',
  eyebrow: 'var(--chronivs-text-eyebrow)',
} as const;

export const fontWeight = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
} as const;

export const lineHeight = {
  tight: '1.04',
  snug: '1.08',
  normal: '1.5',
  relaxed: '1.75',
} as const;

export const letterSpacing = {
  tight: '-0.01em',
  normal: '0.01em',
  wide: '0.06em',
  wider: '0.14em',
  widest: '0.22em',
} as const;

export type FontFamilyToken = typeof fontFamily;
export type FontSizeToken = typeof fontSize;
