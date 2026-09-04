export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type FaqCategory = {
  id: string;
  title: string;
  items: FaqItem[];
};

export const FAQ_HERO = {
  eyebrow: 'Questions & Answers',
  title: 'Everything you need to know.',
  description: 'Find answers before creating your experience.',
} as const;

export const FAQ_CTA = {
  title: 'Still have questions?',
  button: 'Contact Us',
  href: '/contact',
} as const;

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: 'creating',
    title: 'Creating Experiences',
    items: [
      {
        id: 'what-is-chronivs',
        question: 'What is Chronivs?',
        answer:
          'Chronivs is a premium platform for creating cinematic digital experiences for life\'s most meaningful moments — birthdays, anniversaries, proposals, and more. Instead of sending an ordinary message or gift, you craft a beautifully designed, shareable experience hosted on a unique link that feels personal, polished, and unforgettable.',
      },
      {
        id: 'how-long',
        question: 'How long does it take?',
        answer:
          'Most experiences can be created in 2-5 minutes using Chronivs Studio. The time depends on how many photos, messages, and personal details you add. Once you are satisfied with your preview, publishing and sharing happen instantly after successful checkout.',
      },
    ],
  },
  {
    id: 'payments',
    title: 'Payments',
    items: [
      {
        id: 'how-payment-works',
        question: 'How does payment work?',
        answer:
          'Chronivs uses Razorpay for secure checkout. You can pay via UPI, credit or debit cards, net banking, and supported wallets. Payment is collected before your experience is published, and your shareable link is generated only after the transaction succeeds.',
      },
      {
        id: 'payment-fails',
        question: 'What if payment fails?',
        answer:
          'If payment fails, your experience will not be published and you will not receive a live link. You can safely retry checkout from Studio. If an amount was debited but the order did not complete, Razorpay typically reverses the charge automatically within a few business days.',
      },
      {
        id: 'refund',
        question: 'Can I request a refund?',
        answer:
          'Refunds may be considered for verified billing errors, duplicate charges, or technical failures that prevent delivery. Successfully published digital experiences are generally non-refundable once the shareable link is live. See our Refund Policy or contact hello@chronivs.com within 7 days of purchase.',
      },
    ],
  },
  {
    id: 'customization',
    title: 'Customization',
    items: [
      {
        id: 'edit-later',
        question: 'Can I edit later?',
        answer:
          'You can continue refining your experience in Studio before payment and publication — adjust text, photos, and details until it feels perfect. After publishing, changes may be limited. Contact hello@chronivs.com if you need help with updates after your experience goes live.',
      },
      {
        id: 'upload-photos',
        question: 'Can I upload my own photos?',
        answer:
          'Yes. Chronivs supports photo uploads so you can personalize your experience with your own memories. Images are securely stored, optimized for fast loading, and displayed beautifully across phones, tablets, and desktops.',
      },
      {
        id: 'change-music',
        question: 'Can I change music?',
        answer:
          'Yes. Many templates include music you can preview and select during customization. Available tracks depend on the template and occasion you choose, helping you match the mood of your celebration.',
      },
    ],
  },
  {
    id: 'sharing',
    title: 'Sharing',
    items: [
      {
        id: 'qr-code',
        question: 'Can I share using a QR code?',
        answer:
          'Yes. Every published experience includes a unique shareable link that can be turned into a QR code using any standard QR generator. This works beautifully for printed cards, gift boxes, or surprise reveals.',
      },
      {
        id: 'who-can-view',
        question: 'Can anyone view my experience?',
        answer:
          'Only people with your unique shareable link can view your published experience. Chronivs does not publicly list experiences. Share your link only with the people you want to see it.',
      },
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy',
    items: [
      {
        id: 'photos-secure',
        question: 'Are my uploaded photos secure?',
        answer:
          'Yes. Uploaded photos are stored securely using Cloudinary, our trusted media delivery partner. Your content is used solely to render and deliver your experience and is handled with privacy and care.',
      },
    ],
  },
  {
    id: 'technical',
    title: 'Technical',
    items: [
      {
        id: 'updates',
        question: 'Will I receive updates?',
        answer:
          'If you provide your email during checkout, you will receive order confirmations and important updates about your experience. Product announcements may be sent separately if you have opted in to communications from Chronivs.',
      },
    ],
  },
];

/** Flat list for FAQ structured data (JSON-LD). */
export const FAQ_ALL_ITEMS = FAQ_CATEGORIES.flatMap((category) => category.items);
