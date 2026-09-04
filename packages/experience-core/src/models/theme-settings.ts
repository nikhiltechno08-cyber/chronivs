/**
 * Visual theme overrides applied on top of a template's base design tokens.
 * Does not replace template CSS — only carries portable configuration.
 */
export interface ThemeSettings {
  /** Color mode preference for the experience shell. */
  readonly mode?: 'light' | 'dark' | 'auto';
  /** Primary accent color (hex, oklch, or design-token key). */
  readonly accentColor?: string;
  /** Named font preset identifier understood by the rendering engine. */
  readonly fontPreset?: string;
  /** Additional design-token overrides keyed by token name. */
  readonly customTokens?: Readonly<Record<string, string>>;
}

/** Default theme settings — defers entirely to the template. */
export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  mode: 'auto',
} as const;
