export const CONTACT_HERO = {
  eyebrow: 'GET IN TOUCH',
  title: 'Let\'s create something beautiful together.',
  description:
    'Whether you need support, have questions or want to collaborate, we\'d love to hear from you.',
} as const;

export const CONTACT_INFO = [
  {
    id: 'support-email',
    label: 'Support Email',
    value: 'support@chronivs.com',
    href: 'mailto:support@chronivs.com',
  },
  {
    id: 'business-email',
    label: 'Business',
    value: 'business@chronivs.com',
    href: 'mailto:business@chronivs.com',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    value: '@chronivs',
    href: 'https://instagram.com/chronivs',
  },
  {
    id: 'response-time',
    label: 'Expected Response',
    value: 'Within 24 hours',
  },
  {
    id: 'location',
    label: 'Location',
    value: 'India',
  },
] as const;

export const CONTACT_FAQ_LINKS = [
  {
    id: 'creating',
    label: 'Need help creating an experience?',
    href: '/faq#creating',
  },
  {
    id: 'payments',
    label: 'Payment Issues',
    href: '/faq#payments',
  },
  {
    id: 'partnerships',
    label: 'Business Partnerships',
    href: 'mailto:business@chronivs.com?subject=Business%20Partnership',
  },
  {
    id: 'bug',
    label: 'Report a Bug',
    href: 'mailto:support@chronivs.com?subject=Bug%20Report',
  },
] as const;

export const CONTACT_CTA = {
  title: 'Create Your First Experience',
  href: '/studio?new=1',
} as const;

export const CONTACT_FORM = {
  submitLabel: 'Send Message',
  successTitle: 'Message received',
  successMessage: 'Thank you for reaching out. Our team will get back to you within 24 hours.',
} as const;
