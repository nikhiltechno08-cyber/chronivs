import { Caveat, Fraunces, IBM_Plex_Mono, Inter } from 'next/font/google';

export const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-mother-sans',
  display: 'swap',
  weight: ['300', '400', '500'],
});

export const fontFraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-mother-serif',
  display: 'swap',
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
});

export const fontCaveat = Caveat({
  subsets: ['latin'],
  variable: '--font-mother-hand',
  display: 'swap',
  weight: ['500', '600', '700'],
});

export const fontMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mother-mono',
  display: 'swap',
  weight: ['400', '500'],
});

export const motherFontVariables = [
  fontInter.variable,
  fontFraunces.variable,
  fontCaveat.variable,
  fontMono.variable,
].join(' ');
