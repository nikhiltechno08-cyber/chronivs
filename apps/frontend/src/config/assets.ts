/**
 * Centralized static asset paths for Chronivs.
 * Replace values with Cloudinary URLs when ready — components should only import from here.
 */
export const Assets = {
  hero: {
    background: 'https://res.cloudinary.com/guj60uab/image/upload/v1785334773/hero_backgrond_wtppls.png?v=2',
    demoVideo: 'https://res.cloudinary.com/guj60uab/video/upload/v1785333359/rec2_u1vynf.mp4',
  },

  occasions: {
    birthday: 'https://res.cloudinary.com/guj60uab/image/upload/v1785333982/birthday_rufaak.png',
    anniversary: 'https://res.cloudinary.com/guj60uab/image/upload/v1785333981/anniversary_ae6cw5.png',
    proposal: 'https://res.cloudinary.com/guj60uab/image/upload/v1785333982/proposal_bq6yir.png',
    wedding: 'https://res.cloudinary.com/guj60uab/image/upload/v1785333984/wedding_mghdrc.png',
    graduation: 'https://res.cloudinary.com/guj60uab/image/upload/v1785333983/graduation_uh37vf.png',
    babyShower: 'https://res.cloudinary.com/guj60uab/image/upload/v1785333981/babyshower_pzzd0m.png',
  },

  templates: {},

  icons: {},

  logos: {},

  backgrounds: {},

  illustrations: {},

  music: {
    perfect: 'https://res.cloudinary.com/guj60uab/video/upload/v1785338776/Perfect_ey1pcn.mp3',
    audio1: 'https://res.cloudinary.com/guj60uab/video/upload/v1785338760/instrumental_e7d16f.mp3',
    romantic: 'https://res.cloudinary.com/guj60uab/video/upload/v1785338759/romantic_ierwfw.mp3',
  },

  videos: {},

  animations: {},
} as const;

/** Maps landing occasion card ids to centralized occasion image paths. */
export const OCCASION_IMAGE_BY_ID = {
  birthday: Assets.occasions.birthday,
  anniversary: Assets.occasions.anniversary,
  proposal: Assets.occasions.proposal,
  wedding: Assets.occasions.wedding,
  graduation: Assets.occasions.graduation,
  babyshower: Assets.occasions.babyShower,
} as const;

export type LandingOccasionId = keyof typeof OCCASION_IMAGE_BY_ID;
