import { type LegalSection } from '@/components/landing/Legal';

/** TODO: Replace with production legal contact email before launch. */
export const TERMS_TODO_LEGAL_EMAIL = 'TODO: legal@chronivs.com';

/** TODO: Replace with registered legal entity name before launch. */
export const TERMS_TODO_COMPANY_NAME = 'TODO: Chronivs Legal Entity Name';

/** TODO: Replace with registered business address before launch. */
export const TERMS_TODO_COMPANY_ADDRESS = 'TODO: Registered company address, India';

export const TERMS_HERO = {
  eyebrow: 'LEGAL',
  title: 'Terms & Conditions',
  description: 'Please read these terms carefully before using Chronivs.',
  lastUpdated: 'Last updated: August 2026',
} as const;

export const TERMS_CTA = {
  title: 'Need clarification?',
  button: 'Contact Support',
  href: '/contact',
} as const;

export const TERMS_SECTIONS: LegalSection[] = [
  {
    id: 'acceptance',
    number: '01',
    title: 'Acceptance of Terms',
    paragraphs: [
      'By accessing or using Chronivs — including our website, Studio, checkout, and published experiences — you agree to be bound by these Terms & Conditions and our Privacy Policy.',
      'If you do not agree to these terms, please do not use the platform. Continued use of Chronivs after updates to these terms constitutes acceptance of the revised terms.',
    ],
  },
  {
    id: 'eligibility',
    number: '02',
    title: 'Eligibility',
    paragraphs: [
      'You must be at least 18 years of age to use Chronivs independently. If you are under 18, you may use the platform only with the involvement and consent of a parent or legal guardian.',
      'By using Chronivs, you represent that you have the legal capacity to enter into a binding agreement and that all information you provide is accurate and complete.',
    ],
  },
  {
    id: 'user-accounts',
    number: '03',
    title: 'User Accounts',
    paragraphs: [
      'Certain features of Chronivs may require you to provide contact information such as your email address during checkout or support interactions.',
      'You are responsible for maintaining the confidentiality of any access credentials associated with your use of the platform and for all activity conducted through your session.',
    ],
  },
  {
    id: 'creating-experiences',
    number: '04',
    title: 'Creating Experiences',
    paragraphs: [
      'Chronivs enables you to create personalized digital experiences using templates, uploaded media, and custom messages. You are solely responsible for all content you upload, write, or publish through the platform.',
      'You represent that you have the right to use any photos, text, music selections, and other materials included in your experience, and that your content does not violate any applicable law or third-party rights.',
      'Chronivs reserves the right to remove or refuse to publish content that violates these terms or applicable law.',
    ],
  },
  {
    id: 'intellectual-property',
    number: '05',
    title: 'Intellectual Property',
    paragraphs: [
      'Chronivs owns the platform, including its software, templates, design systems, branding, and underlying technology. Nothing in these terms transfers ownership of the Chronivs platform to you.',
      'You retain ownership of the photos, messages, and other media you upload. By using Chronivs, you grant us a limited, non-exclusive license to host, process, display, and deliver your content solely for the purpose of creating and sharing your experience.',
    ],
  },
  {
    id: 'payments',
    number: '06',
    title: 'Payments',
    paragraphs: [
      'Paid features, including experience publication, are processed securely through Razorpay. Supported payment methods may include UPI, credit and debit cards, net banking, and supported wallets.',
      'Prices displayed at checkout are final unless otherwise stated. Chronivs does not store your full payment card details. Payment confirmation is required before your experience is published and your shareable link is generated.',
    ],
  },
  {
    id: 'refunds',
    number: '07',
    title: 'Refunds',
    paragraphs: [
      'Refund eligibility for digital experiences is governed by our Refund Policy. Successfully published experiences are generally non-refundable once delivery is complete, except where required by applicable consumer protection law.',
    ],
    relatedLink: {
      href: '/refund-policy',
      label: 'View Refund Policy',
    },
  },
  {
    id: 'acceptable-use',
    number: '08',
    title: 'Acceptable Use',
    intro: 'You agree not to use Chronivs to create, upload, or share content that:',
    items: [
      'Is illegal, fraudulent, or promotes unlawful activity',
      'Uses copyrighted material, trademarks, or private media without proper permission',
      'Is abusive, harassing, hateful, defamatory, or otherwise harmful to others',
    ],
    paragraphs: [
      'We may investigate violations and take appropriate action, including content removal, order cancellation, or account restrictions.',
    ],
  },
  {
    id: 'account-suspension',
    number: '09',
    title: 'Account Suspension',
    paragraphs: [
      'Chronivs may suspend or restrict access to the platform if we reasonably believe you have violated these terms, engaged in fraudulent activity, or misused the service in a way that harms other users or the platform.',
      'Where appropriate, we will attempt to notify you of the reason for suspension. Repeated or serious violations may result in permanent restriction from using Chronivs.',
    ],
  },
  {
    id: 'limitation-of-liability',
    number: '10',
    title: 'Limitation of Liability',
    paragraphs: [
      'Chronivs is provided on an "as is" and "as available" basis to the maximum extent permitted by applicable law. We do not guarantee uninterrupted access or that every experience will meet every expectation.',
      'To the fullest extent permitted by law, Chronivs shall not be liable for indirect, incidental, special, consequential, or punitive damages arising from your use of the platform. Our total liability for any claim shall not exceed the amount you paid to Chronivs for the experience giving rise to the claim.',
    ],
  },
  {
    id: 'governing-law',
    number: '11',
    title: 'Governing Law',
    paragraphs: [
      'These Terms & Conditions are governed by the laws of India, without regard to conflict of law principles. Any disputes arising from these terms or your use of Chronivs shall be subject to the exclusive jurisdiction of the courts located in India, unless otherwise required by applicable law.',
    ],
  },
  {
    id: 'contact-information',
    number: '12',
    title: 'Contact Information',
    paragraphs: [
      `For questions about these terms, contact ${TERMS_TODO_COMPANY_NAME} at ${TERMS_TODO_LEGAL_EMAIL}.`,
      `Postal correspondence may be sent to: ${TERMS_TODO_COMPANY_ADDRESS}.`,
      'We aim to respond to legal and support inquiries within 24 hours on business days.',
    ],
  },
];