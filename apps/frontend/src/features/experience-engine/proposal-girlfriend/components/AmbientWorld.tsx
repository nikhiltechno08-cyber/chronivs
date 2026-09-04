'use client';

import { memo } from 'react';

type AmbientWorldProps = {
  fastTwinkle?: boolean;
};

export const AmbientWorld = memo(function AmbientWorld({ fastTwinkle = false }: AmbientWorldProps) {
  return (
    <>
      <div className="prop-bg-gradient" aria-hidden="true" />
      <div className={`prop-stars${fastTwinkle ? ' fast-twinkle' : ''}`} aria-hidden="true" />
      <div className="prop-moon-glow" aria-hidden="true" />
      <div className="prop-rays" aria-hidden="true" />
      <div className="prop-fog" aria-hidden="true" />
      <div className="prop-vignette" aria-hidden="true" />
    </>
  );
});
