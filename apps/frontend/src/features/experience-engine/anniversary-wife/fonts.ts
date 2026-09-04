import { Caveat, Cormorant_Garamond, Inter } from 'next/font/google';

export const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-aw-sans',
  display: 'swap',
  weight: ['400', '500'],
});

export const fontCormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-aw-serif',
  display: 'swap',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
});

export const fontCaveat = Caveat({
  subsets: ['latin'],
  variable: '--font-aw-script',
  display: 'swap',
  weight: ['500', '700'],
});

export const wifeFontVariables = [fontInter.variable, fontCormorant.variable, fontCaveat.variable].join(
  ' ',
);
