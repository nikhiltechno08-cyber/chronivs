import { type LegalSection } from '@/components/landing/Legal';

/** TODO: Replace with production privacy contact email before launch. */
export const PRIVACY_TODO_SUPPORT_EMAIL = 'TODO: support@chronivs.com';

/** TODO: Replace with registered business address before launch. */
export const PRIVACY_TODO_COMPANY_ADDRESS = 'TODO: Registered company address, India';

export const PRIVACY_HERO = {
  eyebrow: 'LEGAL',
  title: 'Your privacy matters.',
  description:
    'We\'re committed to protecting your personal information while helping you create unforgettable digital experiences.',
  lastUpdated: 'Last updated: August 2026',
} as const;

export const PRIVACY_CTA = {
  title: 'Questions about privacy?',
  button: 'Contact Us',
  href: '/contact',
} as const;

export type { LegalSection as PrivacySection };

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    id: 'information-we-collect',
    number: '01',
    title: 'Information We Collect',
    intro:
      'We collect only the information needed to create, deliver, and support your Chronivs experience. This may include:',
    items: [
      'Name — provided when you personalize an experience or contact support',
      'Email — used for checkout confirmations, delivery updates, and support communication',
      'Uploaded Images — photos you add to personalize your digital experience',
      'Occasion Details — such as birthday, anniversary, or proposal context you select in Studio',
      'Personalized Messages — names, dates, and custom text you include in your experience',
      'Payment Reference IDs — transaction identifiers from Razorpay to confirm successful orders',
      'Device Information — browser type, operating system, and general usage data for security and performance',
    ],
  },
  {
    id: 'how-we-use-information',
    number: '02',
    title: 'How We Use Information',
    intro: 'Your information is used exclusively to operate and improve Chronivs:',
    items: [
      'Create digital experiences — render, host, and deliver the personalized experience you design',
      'Improve product — understand usage patterns to enhance templates, performance, and reliability',
      'Customer support — respond to questions, troubleshoot issues, and assist with orders',
      'Security — detect fraud, prevent abuse, and protect platform integrity',
      'Communication — send order confirmations, delivery links, and essential service updates',
    ],
    paragraphs: [
      'We do not sell your personal information. Data is processed only as necessary to provide the service you request.',
    ],
  },
  {
    id: 'cloudinary',
    number: '03',
    title: 'Cloudinary Image Storage',
    paragraphs: [
      'Photos and media you upload are securely stored and delivered through Cloudinary, our trusted media infrastructure partner. Cloudinary optimizes images for fast, reliable display across phones, tablets, and desktops.',
      'Chronivs stores image URLs and associated metadata in our database — not the raw binary files themselves. This approach keeps your experiences performant while maintaining secure, scalable media delivery.',
    ],
  },
  {
    id: 'payment-information',
    number: '04',
    title: 'Payment Information',
    paragraphs: [
      'All payments on Chronivs are securely processed by Razorpay, a PCI-DSS compliant payment gateway. When you checkout, you enter payment details directly on Razorpay\'s secure interface.',
      'Chronivs never stores your full card number, CVV, or UPI PIN. We retain only payment reference IDs and order status needed to confirm your purchase and publish your experience.',
    ],
  },
  {
    id: 'cookies',
    number: '05',
    title: 'Cookies',
    paragraphs: [
      'Chronivs uses cookies and similar technologies to keep you signed in during Studio sessions, remember preferences, and understand how the product is used.',
      'Essential cookies are required for authentication and core functionality. Analytics cookies help us improve the platform. You may control non-essential cookies through your browser settings where applicable.',
    ],
  },
  {
    id: 'data-security',
    number: '06',
    title: 'Data Security',
    intro: 'We apply industry-standard safeguards to protect your information:',
    highlights: [
      {
        title: 'Encryption',
        description:
          'Data in transit is protected using HTTPS/TLS. Sensitive credentials and integration secrets are never exposed in client-side code.',
      },
      {
        title: 'Secure Storage',
        description:
          'Experience data and media references are stored on secure infrastructure with access controls and monitoring appropriate for a production SaaS platform.',
      },
      {
        title: 'Limited Access',
        description:
          'Access to user data is restricted to authorized personnel and systems required to operate Chronivs, support customers, and maintain platform security.',
      },
    ],
  },
  {
    id: 'user-rights',
    number: '07',
    title: 'User Rights',
    intro: 'Depending on applicable law, you may have the right to:',
    items: [
      'Request deletion — ask us to remove your personal data and uploaded content where legally permitted',
      'Request correction — update inaccurate information associated with your account or order',
      'Request exported data — receive a copy of personal data we hold about you in a portable format',
    ],
    paragraphs: [
      'To exercise these rights, contact us using the details below. We will respond within a reasonable timeframe in accordance with applicable privacy regulations.',
    ],
  },
  {
    id: 'contact',
    number: '08',
    title: 'Contact',
    paragraphs: [
      `For privacy-related questions, data requests, or concerns, email us at ${PRIVACY_TODO_SUPPORT_EMAIL}.`,
      `Postal correspondence may be sent to: ${PRIVACY_TODO_COMPANY_ADDRESS}.`,
      'We take every privacy inquiry seriously and aim to respond within 24 hours on business days.',
    ],
  },
];
