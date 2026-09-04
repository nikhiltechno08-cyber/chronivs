export const LANDING_LINKS = {
  home: '#home',
  templates: '#templates',
  reviews: '#reviews',
  preview: '#preview',
  how: '#how',
  contact: '#contact',
  studio: '/studio?new=1',
} as const;

export const NAV_LINKS = [
  { label: 'Home', href: LANDING_LINKS.home },
  { label: 'Templates', href: LANDING_LINKS.templates },
  { label: 'Reviews', href: LANDING_LINKS.reviews },
  { label: 'Contact', href: LANDING_LINKS.contact },
] as const;

export const HERO_CONTENT = {
  eyebrow: 'Crafted moments, not messages',
  lines: ['More Than A Gift.', "A Memory They'll Never", 'Forget.'],
  highlightIndex: 1,
  highlightWord: 'A Memory',
  sub: 'Create unforgettable digital experiences powered by emotion — birthdays, anniversaries, proposals. Every special moment deserves more than a simple message.',
} as const;

export const SOCIAL_PROOF_STATS = [
  { value: 12000, suffix: '+', label: 'Memories Created' },
  { value: 4800, suffix: '+', label: 'Happy Creators' },
  { decimal: 4.9, suffix: '★', label: 'Average Rating' },
] as const;

export const PRESS_LOGOS = ['Forbes', 'TechCrunch', 'The Verge', 'Wired', 'Vogue'] as const;

export const OCCASIONS = [
  { id: 'birthday', category: '01 — Celebration', name: 'Birthday', art: 'art-birthday', locked: false },
  { id: 'anniversary', category: '02 — Together', name: 'Anniversary', art: 'art-anniversary', locked: false },
  { id: 'proposal', category: '03 — The Question', name: 'Proposal', art: 'art-proposal', locked: false },
  { id: 'wedding', category: '07 — Union', name: 'Wedding', art: 'art-wedding', locked: true },
  { id: 'graduation', category: '08 — Milestone', name: 'Graduation', art: 'art-graduation', locked: true },
  { id: 'babyshower', category: '09 — New Beginnings', name: 'Baby Shower', art: 'art-babyshower', locked: true },
] as const;

export const HOW_IT_WORKS_STEPS = [
  { step: '01', title: 'Choose Occasion', description: "Start with the moment you're honoring — a birthday, a proposal, an anniversary, and more." },
  { step: '02', title: 'Customize', description: 'Add photos, words, music and memories. Make it unmistakably yours.' },
  { step: '03', title: 'Preview', description: "Watch your experience come to life exactly as they'll see it." },
  { step: '04', title: 'Publish', description: 'One click, and your experience is live — beautifully hosted, ready to share.' },
  { step: '05', title: 'Share', description: "Send a single link. Watch someone you love receive something they'll never forget." },
] as const;

export const FEATURES = [
  {
    title: 'AI Powered',
    description: 'Create personalized experiences in minutes, guided by intelligence tuned for emotion.',
    icon: 'sparkle' as const,
  },
  {
    title: 'Fully Responsive',
    description: 'Looks perfect everywhere — laptop, tablet or phone, without compromise.',
    icon: 'devices' as const,
  },
  {
    title: 'Lifetime Memories',
    description: 'One link. Forever remembered — hosted, preserved, and always ready to revisit.',
    icon: 'heart' as const,
  },
] as const;

export const TESTIMONIALS = [
  {
    quote: "My partner cried before he even finished scrolling. I've never seen a gift feel this considered.",
    name: 'Priya M.',
    occasion: 'Anniversary experience',
  },
  {
    quote: 'I proposed through Chronivs. She said yes before the second scene even loaded.',
    name: 'Aditya R.',
    occasion: 'Proposal experience',
  },
  {
    quote: "It felt like a film made just for my mother. Nothing I've bought her has ever landed like this.",
    name: 'Sana K.',
    occasion: "Mother's day experience",
  },
] as const;

export const SITE_ROUTES = {
  home: '/',
  about: '/about',
  faq: '/faq',
  contact: '/contact',
  privacy: '/privacy-policy',
  terms: '/terms',
  refund: '/refund-policy',
  shipping: '/shipping-delivery',
} as const;

export const FOOTER_BRAND = {
  description:
    "Crafting unforgettable digital experiences for birthdays, anniversaries, proposals and life's most meaningful moments.",
} as const;

export const FOOTER_SOCIAL_LINKS = [
  { label: 'Instagram', abbr: 'IG', href: '#' },
  { label: 'LinkedIn', abbr: 'IN', href: '#' },
  { label: 'Twitter', abbr: 'X', href: '#' },
] as const;

export const FOOTER_LINKS = {
  product: [
    { label: 'Templates', href: '/#templates' },
    { label: 'Create Experience', href: LANDING_LINKS.studio },
    { label: 'How It Works', href: '/#how' },
  ],
  company: [
    { label: 'About', href: SITE_ROUTES.about },
    { label: 'FAQ', href: SITE_ROUTES.faq },
    { label: 'Contact', href: SITE_ROUTES.contact },
  ],
  legal: [
    { label: 'Privacy Policy', href: SITE_ROUTES.privacy },
    { label: 'Terms & Conditions', href: SITE_ROUTES.terms },
    { label: 'Refund Policy', href: SITE_ROUTES.refund },
    { label: 'Shipping & Delivery Policy', href: SITE_ROUTES.shipping },
  ],
} as const;

export const HERO_DEVICES = [
  { type: 'laptop' as const, label: 'Birthday', title: 'For Ananya, with love', depth: 18, lines: [70, 45] },
  { type: 'tablet' as const, label: 'Proposal', title: 'Will you?', depth: 30, lines: [60, 40] },
  { type: 'phone' as const, label: 'Anniversary', title: '5 years, us', depth: 42, lines: [70, 35] },
] as const;

export const PREVIEW_DEVICES = [
  { type: 'tablet' as const, label: 'Anniversary', title: 'Five years', depth: 20, lines: [60, 40], variant: 'pv-tablet' as const },
  { type: 'laptop' as const, label: 'Birthday', title: 'Happy 27th, Rhea', depth: 10, lines: [65, 42], variant: 'pv-laptop' as const },
  { type: 'phone' as const, label: 'Proposal', title: 'Marry me?', depth: 30, lines: [55, 38], variant: 'pv-phone' as const },
] as const;
