import { type LegalSection } from '@/components/landing/Legal';

export const SHIPPING_HERO = {
  eyebrow: 'LEGAL',
  title: 'Shipping & Delivery Policy',
  description: 'Chronivs delivers digital experiences instantly—no physical shipping required.',
  lastUpdated: 'Last updated: August 2026',
} as const;

export const SHIPPING_CTA = {
  title: 'Need delivery help?',
  button: 'Contact Support',
  href: '/contact',
} as const;

export const SHIPPING_SECTIONS: LegalSection[] = [
  {
    id: 'digital-delivery',
    number: '01',
    title: 'Digital Delivery',
    paragraphs: [
      'Chronivs is a digital-only platform. Every product we offer is a personalized online experience — not a physical item. There are no packages, couriers, or postal addresses involved in delivery.',
      'After you complete checkout and your experience is published, delivery happens electronically through a unique shareable link hosted on Chronivs infrastructure.',
    ],
  },
  {
    id: 'delivery-time',
    number: '02',
    title: 'Delivery Time',
    paragraphs: [
      'Delivery is usually instant once payment is successful and your experience is published. In most cases, your shareable link is available within moments of completing checkout.',
      'You will receive confirmation when your experience is live and ready to share with the people who matter most.',
    ],
  },
  {
    id: 'sharing',
    number: '03',
    title: 'Sharing',
    paragraphs: [
      'Your delivered experience can be accessed through the unique link generated at publish time. Share this link via message, email, or any channel you prefer — recipients can view it on phones, tablets, and desktops.',
      'QR code sharing is supported today by converting your experience link through any standard QR generator. Native in-app QR generation is planned as a future enhancement to make surprise reveals even easier.',
    ],
  },
  {
    id: 'delays',
    number: '04',
    title: 'Delays',
    paragraphs: [
      'While delivery is designed to be immediate, occasional delays may occur during scheduled platform maintenance, high-traffic periods, or rare processing interruptions.',
      'If your experience link is not available shortly after payment, wait a few minutes and refresh. Persistent delays are uncommon and our team monitors delivery health continuously.',
    ],
  },
  {
    id: 'failed-delivery',
    number: '05',
    title: 'Failed Delivery',
    paragraphs: [
      'If payment succeeded but you did not receive a working shareable link, contact our support team at support@chronivs.com with your payment reference ID and registered email.',
      'After verifying your order, support can assist with regenerating access to your experience or resolving technical delivery issues. We aim to restore access as quickly as possible.',
    ],
  },
  {
    id: 'physical-shipping',
    number: '06',
    title: 'Physical Shipping',
    paragraphs: [
      'Chronivs currently ships no physical goods. We do not offer printed cards, merchandise, or courier delivery as part of our standard service.',
      'If physical gifting formats become available in the future, this policy will be updated accordingly. Until then, all Chronivs products are delivered digitally only.',
    ],
  },
];
