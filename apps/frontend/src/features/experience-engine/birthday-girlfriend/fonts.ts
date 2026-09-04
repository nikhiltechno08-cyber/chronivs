import { Caveat, Cormorant_Garamond, Jost } from 'next/font/google';

export const fontJost = Jost({
  subsets: ['latin'],
  variable: '--font-birthday-sans',
  display: 'swap',
  weight: ['300', '400', '500'],
});

export const fontCormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-birthday-serif',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
});

export const fontCaveat = Caveat({
  subsets: ['latin'],
  variable: '--font-birthday-hand',
  display: 'swap',
  weight: ['500', '600', '700'],
});

export const birthdayFontVariables = [
  fontJost.variable,
  fontCormorant.variable,
  fontCaveat.variable,
].join(' ');
