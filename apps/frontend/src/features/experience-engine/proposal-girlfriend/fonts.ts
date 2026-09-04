import { Cormorant_Garamond, Dancing_Script, Jost, Playfair_Display } from 'next/font/google';

export const fontPlayfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-prop-display',
  display: 'swap',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
});

export const fontCormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-prop-serif',
  display: 'swap',
  weight: ['400', '500'],
  style: ['normal', 'italic'],
});

export const fontDancing = Dancing_Script({
  subsets: ['latin'],
  variable: '--font-prop-script',
  display: 'swap',
  weight: ['600', '700'],
});

export const fontJost = Jost({
  subsets: ['latin'],
  variable: '--font-prop-sans',
  display: 'swap',
  weight: ['300', '400', '500'],
});

export const propFontVariables = [
  fontPlayfair.variable,
  fontCormorant.variable,
  fontDancing.variable,
  fontJost.variable,
].join(' ');
