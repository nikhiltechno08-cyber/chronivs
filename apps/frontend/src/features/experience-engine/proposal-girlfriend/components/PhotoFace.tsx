'use client';

import { memo } from 'react';

type PhotoFaceProps = {
  photoUrl?: string;
  className?: string;
  alt?: string;
};

export const PhotoFace = memo(function PhotoFace({
  photoUrl,
  className = '',
  alt = '',
}: PhotoFaceProps) {
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={photoUrl} alt={alt} className={className} />
    );
  }

  return <div className="prop-photo-silhouette">your photo here</div>;
});
