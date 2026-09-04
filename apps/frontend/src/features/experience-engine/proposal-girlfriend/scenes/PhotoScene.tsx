'use client';

import { memo, useEffect, useState } from 'react';

import { resolvePhotoUrl } from '../constants/story';
import { PhotoFace } from '../components/PhotoFace';
import { SceneShell } from '../components/SceneShell';
import type { SceneComponentProps } from '../types';

export const PhotoScene = memo(function PhotoScene({ data, onNext, isActive }: SceneComponentProps) {
  const photoUrl = resolvePhotoUrl(data);
  const [sharp, setSharp] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setSharp(false);
      return;
    }
    const t = window.setTimeout(() => setSharp(true), 500);
    return () => clearTimeout(t);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <SceneShell id="scene-prop-photo">
      <p className="prop-eyebrow prop-reveal">The First Smile</p>
      <div className="prop-photo-frame prop-reveal" style={{ animationDelay: '0.2s' }}>
        <div className="prop-photo-inner">
          <div className={`prop-photo-develop${sharp ? ' sharp' : ''}`}>
            <PhotoFace photoUrl={photoUrl} alt="" />
          </div>
        </div>
      </div>
      <p className="prop-quote prop-reveal" style={{ animationDelay: '0.6s' }}>
        I still remember this smile...
      </p>
      <button
        type="button"
        className="prop-btn prop-reveal"
        style={{ animationDelay: '1.2s' }}
        onClick={onNext}
      >
        I Remember
      </button>
    </SceneShell>
  );
});
