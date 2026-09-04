import { Fraunces, IBM_Plex_Mono, Inter } from 'next/font/google';

export const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
});

export const fontDisplay = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: 'variable',
  style: ['normal', 'italic'],
});

export const fontMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500'],
});

export const fontVariables = [fontSans.variable, fontDisplay.variable, fontMono.variable].join(
  ' ',
);

export const fonts = {
  sans: fontSans,
  display: fontDisplay,
  mono: fontMono,
  variables: fontVariables,
} as const;
