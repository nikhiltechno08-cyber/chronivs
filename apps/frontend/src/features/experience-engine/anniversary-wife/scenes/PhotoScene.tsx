'use client';

import { memo, useEffect, useState } from 'react';

import { CTAButton } from '../components/CTAButton';
import { PhotoFace } from '../components/PhotoFace';
import { SceneShell } from '../components/SceneShell';
import { resolveWifePhotos } from '../constants/story';
import type { SceneComponentProps } from '../types';

export const PhotoScene = memo(function PhotoScene({ data, onNext, isActive }: SceneComponentProps) {
  const photos = resolveWifePhotos(data.photos);
  const [cleared, setCleared] = useState(false);
  const [showCaption, setShowCaption] = useState(false);
  const [showCta, setShowCta] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setCleared(false);
      setShowCaption(false);
      setShowCta(false);
      return;
    }
    const t1 = window.setTimeout(() => {
      setCleared(true);
      setShowCaption(true);
    }, 700);
    const t2 = window.setTimeout(() => setShowCta(true), 2600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <SceneShell id="scene-wife-photo">
      <div className="aw-eyebrow">THE DAY EVERYTHING CHANGED</div>
      <div className={`aw-photo-wrap ${cleared ? 'clear' : ''}`}>
        <div className="aw-photo-content aw-ph">
          {photos[0] ? (
            <PhotoFace photoUrl={photos[0]} slotIndex={0} alt="" />
          ) : (
            <span aria-hidden="true">📷</span>
          )}
        </div>
        <div className="aw-photo-sheen" />
      </div>
      <div className={`aw-caption ${showCaption ? 'show' : ''}`}>
        The day my forever found its beginning.
      </div>
      <CTAButton show={showCta} onClick={onNext} small>
        Continue
      </CTAButton>
    </SceneShell>
  );
});
