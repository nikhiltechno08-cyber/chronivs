'use client';

import { memo } from 'react';

import { FALLBACK_PHOTO_GRADIENTS } from '../../hooks/useExperienceData';
import type { PhotoSlotIndex } from '../types';
import { PerfectHeart } from './PerfectHeart';

type PhotoFrameProps = {
  photoUrl?: string;
  slotIndex?: PhotoSlotIndex;
  className?: string;
  variant?: 'polaroid' | 'develop' | 'memory';
  developActive?: boolean;
};

function HeartIcon() {
  return <PerfectHeart />;
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9 3l1.2 3H21v14H3V6h5.8L9 3z" />
    </svg>
  );
}

export const PhotoFrame = memo(function PhotoFrame({
  photoUrl,
  slotIndex = 0,
  className = '',
  variant = 'polaroid',
  developActive = false,
}: PhotoFrameProps) {
  const gradient = FALLBACK_PHOTO_GRADIENTS[slotIndex];
  const hasPhoto = Boolean(photoUrl);

  const inner = (
    <div
      className="photo-ph"
      style={{
        background: hasPhoto ? undefined : gradient,
        filter: variant === 'develop' && !developActive ? 'blur(20px) saturate(0) brightness(1.4)' : undefined,
        transition: variant === 'develop' ? 'filter 3.2s ease-out' : undefined,
      }}
    >
      {hasPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="ph-icon">
          {variant === 'develop' ? <CameraIcon /> : <HeartIcon />}
        </div>
      )}
    </div>
  );

  if (variant === 'polaroid') {
    return <div className={`polaroid ${className}`}>{inner}</div>;
  }

  if (variant === 'develop') {
    return <div className={`develop-frame ${className}`}>{inner}</div>;
  }

  return <div className={className}>{inner}</div>;
});
