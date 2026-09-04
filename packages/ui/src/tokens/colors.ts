/**
 * Chronivs Design System — Color Tokens
 * Extracted from the approved landing page visual language.
 */

export const primary = {
  gold: '#cda45e',
  goldBright: '#e6c584',
  champagne: '#ddc79a',
  ivory: '#f4efe4',
} as const;

export const neutral = {
  ink: '#efe9dc',
  inkMuted: '#a49c8d',
  inkFaint: '#736c60',
  black: '#090909',
  blackSoft: '#0d0d0c',
} as const;

export const status = {
  success: '#6bbf8a',
  warning: '#e6b85c',
  danger: '#e07070',
  info: '#7aabde',
} as const;

export type PrimaryToken = typeof primary;
export type NeutralToken = typeof neutral;
export type StatusToken = typeof status;
