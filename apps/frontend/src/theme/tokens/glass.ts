export const glass = {
  background: 'var(--glass-bg)',
  border: 'var(--glass-border)',
  blur: 'var(--glass-blur)',
  saturation: 'var(--glass-saturation)',
} as const;

export type GlassToken = typeof glass;
