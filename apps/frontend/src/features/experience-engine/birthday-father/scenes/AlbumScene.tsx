'use client';

import { memo, useEffect, useState, type MouseEvent } from 'react';

import { SceneShell } from '../components/SceneShell';
import { ALBUM_PAGES, resolveFatherPhotos } from '../constants/story';
import { PhotoFace } from '../components/PhotoFace';
import type { PhotoSlotIndex, SceneComponentProps } from '../types';

/** HTML Chapter Five — page-flip memory album */
export const AlbumScene = memo(function AlbumScene({ data, onNext, isActive }: SceneComponentProps) {
  const photos = resolveFatherPhotos(data.photos);
  const [flipped, setFlipped] = useState(0);
  const [readyContinue, setReadyContinue] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setFlipped(0);
      setReadyContinue(false);
    }
  }, [isActive]);

  if (!isActive) return null;

  const onArrow = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (readyContinue) {
      onNext();
      return;
    }
    if (flipped < ALBUM_PAGES.length) {
      const next = flipped + 1;
      setFlipped(next);
      if (next >= ALBUM_PAGES.length) setReadyContinue(true);
    }
  };

  return (
    <SceneShell theme="light" id="scene-father-album">
      <span className="fb-chapter">Chapter Five — The Memory Album</span>

      <div className="fb-album-book">
        <div className="fb-album-cover" aria-hidden="true">
          <span className="hand">Our Story</span>
        </div>
        {ALBUM_PAGES.map((page, i) => (
          <div
            key={page.caption}
            className={`fb-album-page ${flipped > i ? 'flipped' : ''}`}
            style={{ zIndex: ALBUM_PAGES.length - i + 2 }}
          >
            <div className="fb-album-polaroid">
              {photos[i] ? (
                <PhotoFace photoUrl={photos[i]} slotIndex={i as PhotoSlotIndex} alt={page.caption} />
              ) : (
                <span className="fb-album-emoji" aria-hidden="true">
                  {page.emoji}
                </span>
              )}
            </div>
            <p className="fb-album-caption">{page.caption}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="fb-album-arrow"
        onClick={onArrow}
        aria-label={readyContinue ? 'Open the Lessons' : 'Flip page'}
      >
        {readyContinue ? 'Open the Lessons ➜' : '➜'}
      </button>
    </SceneShell>
  );
});
