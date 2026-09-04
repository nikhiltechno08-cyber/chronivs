'use client';

import { memo, useState } from 'react';

import { CTAButton } from '../components/CTAButton';
import { PhotoFace } from '../components/PhotoFace';
import { SceneShell } from '../components/SceneShell';
import { FRAME_POSITIONS, MEMORY_FRAMES, resolveWifePhotos } from '../constants/story';
import type { PhotoSlotIndex, SceneComponentProps } from '../types';

export const FramesScene = memo(function FramesScene({ data, onNext, isActive }: SceneComponentProps) {
  const photos = resolveWifePhotos(data.photos);
  const [modalIdx, setModalIdx] = useState<number | null>(null);

  if (!isActive) return null;

  return (
    <SceneShell id="scene-wife-frames">
      <div className="aw-eyebrow">MOMENTS THAT STILL MAKE ME SMILE</div>
      <div className="aw-frames-field">
        {MEMORY_FRAMES.map((mem, i) => {
          const pos = FRAME_POSITIONS[i]!;
          return (
          <button
            key={mem.caption}
            type="button"
            className="aw-mem-frame aw-ph"
            style={{
              left: `${pos[0]}%`,
              top: `${pos[1]}%`,
              ['--rot' as string]: `${pos[2]}deg`,
              animationDelay: `${i * 0.5}s`,
            }}
            onClick={() => setModalIdx(i)}
            aria-label={mem.caption}
          >
            {photos[i] ? (
              <PhotoFace photoUrl={photos[i]} slotIndex={i as PhotoSlotIndex} alt="" />
            ) : (
              <span aria-hidden="true">{mem.icon}</span>
            )}
          </button>
          );
        })}
        <div className={`aw-mem-modal ${modalIdx !== null ? 'show' : ''}`}>
          <div className="aw-mem-modal-card">
            <div className="aw-mem-modal-big">
              {modalIdx !== null &&
                (photos[modalIdx] ? (
                  <PhotoFace photoUrl={photos[modalIdx]} slotIndex={modalIdx as PhotoSlotIndex} alt="" />
                ) : (
                  MEMORY_FRAMES[modalIdx]!.icon
                ))}
            </div>
            <div className="aw-mem-modal-cap">
              {modalIdx !== null ? MEMORY_FRAMES[modalIdx]!.caption : ''}
            </div>
            <button type="button" className="aw-mem-modal-close" onClick={() => setModalIdx(null)}>
              Close
            </button>
          </div>
        </div>
      </div>
      <CTAButton show onClick={onNext} small>
        Keep Walking With Me
      </CTAButton>
    </SceneShell>
  );
});
