export const container = {
  max: 'var(--chronivs-container-max)',
  content: 'var(--chronivs-container-content)',
  narrow: 'var(--chronivs-container-narrow)',
  paddingMobile: 'var(--chronivs-padding-mobile)',
  paddingTablet: 'var(--chronivs-padding-tablet)',
  paddingDesktop: 'var(--chronivs-padding-desktop)',
} as const;

export type ContainerToken = typeof container;
