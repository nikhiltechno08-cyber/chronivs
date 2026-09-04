import { type LegalSection } from '@/components/landing/Legal';

export const REFUND_HERO = {
  eyebrow: 'LEGAL',
  title: 'Refund Policy',
  description: 'Our refund policy for personalized digital experiences.',
  lastUpdated: 'Last updated: August 2026',
} as const;

export const REFUND_CTA = {
  title: 'Need refund assistance?',
  button: 'Contact Support',
  href: '/contact',
} as const;

export const REFUND_SECTIONS: LegalSection[] = [
  {
    id: 'digital-product-policy',
    number: '01',
    title: 'Digital Product Policy',
    paragraphs: [
      'Chronivs creates personalized digital experiences — each order is customized with your photos, messages, occasion details, and chosen template. Because every experience is made to order and delivered electronically, refunds are evaluated based on delivery status and the nature of the issue reported.',
      'Once an experience is successfully published and your shareable link is live, the digital product has been fulfilled. This policy explains when refunds may be granted and when they generally cannot.',
    ],
  },
  {
    id: 'refund-eligibility',
    number: '02',
    title: 'Refund Eligibility',
    intro: 'A refund may be approved only in the following circumstances:',
    items: [
      'Technical failure — a verified platform error prevented your experience from being generated or published after successful payment',
      'Duplicate payment — you were charged more than once for the same order due to a processing error',
      'Payment captured but experience not generated — payment succeeded but no published experience or shareable link was delivered within a reasonable timeframe',
    ],
    paragraphs: [
      'Refund requests must be submitted within 7 days of the original transaction. Include your payment reference ID, registered email, and a brief description of the issue so our team can investigate promptly.',
    ],
  },
  {
    id: 'non-refundable',
    number: '03',
    title: 'Non-refundable Situations',
    intro: 'Refunds are generally not available when:',
    items: [
      'Experience successfully created — your experience was published and a shareable link was delivered',
      'User changed mind — you decided not to use or share the experience after successful delivery',
      'Incorrect information entered — names, dates, messages, or photos were submitted incorrectly by the user during customization',
    ],
    paragraphs: [
      'We encourage you to preview your experience carefully in Studio before completing checkout. Except where required by applicable consumer protection law in India, successfully delivered digital experiences are non-refundable.',
    ],
  },
  {
    id: 'payment-failures',
    number: '04',
    title: 'Payment Failures',
    paragraphs: [
      'If a payment attempt fails, your experience will not be published and no shareable link will be generated. You may safely retry checkout from Chronivs Studio.',
      'In cases where an amount was debited but the order did not complete — for example, due to a network interruption or gateway timeout — Razorpay typically reverses the charge automatically within a few business days. If a debit persists beyond this window, contact our support team with your transaction reference for assistance.',
      'Chronivs does not store your full card or UPI credentials. All payment disputes related to failed or duplicate debits are handled in coordination with Razorpay\'s standard reversal processes.',
    ],
  },
  {
    id: 'contact-support',
    number: '05',
    title: 'Contact Support',
    paragraphs: [
      'For refund requests, billing questions, or delivery issues, contact us at support@chronivs.com with your order details and payment reference ID.',
      'Our support team reviews every request individually and aims to respond within 24 hours on business days. Please contact us before initiating a chargeback — we will work to resolve legitimate issues quickly and fairly.',
    ],
  },
];
