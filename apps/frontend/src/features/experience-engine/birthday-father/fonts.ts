import { Caveat, Cormorant_Garamond, Inter } from 'next/font/google';

export const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-father-sans',
  display: 'swap',
  weight: ['300', '400', '500'],
});

export const fontCormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-father-serif',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
});

export const fontCaveat = Caveat({
  subsets: ['latin'],
  variable: '--font-father-hand',
  display: 'swap',
  weight: ['500', '600', '700'],
});

export const fatherFontVariables = [fontInter.variable, fontCormorant.variable, fontCaveat.variable].join(' ');
