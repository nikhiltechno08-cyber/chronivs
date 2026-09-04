/** Icon sizing and stroke standards */

export const iconSize = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

export const iconStroke = {
  thin: 1.25,
  default: 1.5,
  bold: 2,
} as const;

export const iconPadding = {
  sm: 6,
  md: 8,
  lg: 10,
} as const;

/** Minimum touch target for icon buttons */
export const iconTouchTarget = 44;

export type IconSizeToken = typeof iconSize;
export type IconStrokeToken = typeof iconStroke;
