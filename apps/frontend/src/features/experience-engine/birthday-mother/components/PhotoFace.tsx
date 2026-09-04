'use client';

import { memo } from 'react';

import { MOTHER_PHOTO_GRADIENTS } from '../constants/story';
import type { PhotoSlotIndex } from '../types';

type PhotoFaceProps = {
  photoUrl?: string;
  slotIndex?: PhotoSlotIndex;
  className?: string;
  alt?: string;
};

export const PhotoFace = memo(function PhotoFace({
  photoUrl,
  slotIndex = 0,
  className = '',
  alt = '',
}: PhotoFaceProps) {
  const gradient = MOTHER_PHOTO_GRADIENTS[slotIndex];

  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={photoUrl} alt={alt} className={className} loading="lazy" decoding="async" />
    );
  }

  return (
    <div
      className={`mb-photo-face ${className}`}
      style={{ background: gradient }}
      aria-hidden={alt ? undefined : true}
      role={alt ? 'img' : undefined}
      aria-label={alt || undefined}
    />
  );
});
