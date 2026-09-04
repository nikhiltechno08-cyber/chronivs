import type { ReactNode } from 'react';

type FeatureIconProps = {
  type: 'sparkle' | 'devices' | 'heart';
};

export function FeatureIcon({ type }: FeatureIconProps) {
  const icons: Record<FeatureIconProps['type'], ReactNode> = {
    sparkle: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.6 4.7L18 9l-4.4 1.3L12 15l-1.6-4.7L6 9l4.4-1.3L12 3z" />
        <path strokeLinecap="round" d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z" />
      </svg>
    ),
    devices: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="4" width="14" height="10" rx="1.2" strokeLinecap="round" />
        <rect x="16" y="9" width="6" height="11" rx="1.2" strokeLinecap="round" />
      </svg>
    ),
    heart: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 20s-7-4.4-9.3-8.8C1.3 8 2.9 5 6 5c2 0 3.3 1.1 4 2.2C10.7 6.1 12 5 14 5c3.1 0 4.7 3 3.3 6.2C15 15.6 12 20 12 20z"
        />
      </svg>
    ),
  };

  return <div className="landing-f-icon">{icons[type]}</div>;
}
