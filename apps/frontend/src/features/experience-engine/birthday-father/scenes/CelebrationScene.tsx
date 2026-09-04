'use client';

import { memo, useEffect, useState } from 'react';

import { CTAButton } from '../components/CTAButton';
import { PhotoFace } from '../components/PhotoFace';
import { SceneShell } from '../components/SceneShell';
import { resolveFatherPhotos } from '../constants/story';
import type { PhotoSlotIndex, SceneComponentProps } from '../types';

/** HTML Chapter Nine — Happy Birthday celebration only */
export const CelebrationScene = memo(function CelebrationScene({
  data,
  onNext,
  isActive,
}: SceneComponentProps) {
  const photos = resolveFatherPhotos(data.photos);
  const [titleIn, setTitleIn] = useState(false);
  const [bright, setBright] = useState(false);
  const [showCta, setShowCta] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setTitleIn(false);
      setBright(false);
      setShowCta(false);
      return;
    }
    const t1 = window.setTimeout(() => setTitleIn(true), 200);
    const t2 = window.setTimeout(() => setBright(true), 900);
    const t3 = window.setTimeout(() => setShowCta(true), 1800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isActive]);

  if (!isActive) return null;

  const fatherName = data.receiverName || 'Papa';

  return (
    <SceneShell theme="light" id="scene-father-celebration">
      <span className="fb-chapter">Chapter Nine — The Celebration</span>
      <h1 className={`fb-hbday ${titleIn ? 'show' : ''}`}>
        Happy Birthday,
        <br />
        {fatherName}!
      </h1>
      <div className="fb-mini-photos">
        {photos.slice(0, 3).map((url, i) => (
          <div
            key={`mini-${i}`}
            className={`fb-mini-photo ${bright ? 'bright' : ''}`}
            style={{ animationDelay: `${i * 0.12}s` }}
          >
            {url ? (
              <PhotoFace photoUrl={url} slotIndex={i as PhotoSlotIndex} alt="" />
            ) : (
              <span aria-hidden="true">{['👨‍👦', '🎂', '🏡'][i]}</span>
            )}
          </div>
        ))}
      </div>
      <CTAButton show={showCta} onClick={onNext} className="fb-cta-light">
        Make a Wish
      </CTAButton>
    </SceneShell>
  );
});
