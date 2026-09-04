'use client';

import { memo } from 'react';

import { PhotoFrame } from './PhotoFrame';

type MemoryCardProps = {
  note: string;
  photoUrl?: string;
  photoIndex?: number;
  onClose: () => void;
  visible: boolean;
};

export const MemoryCard = memo(function MemoryCard({
  note,
  photoUrl,
  photoIndex = 2,
  onClose,
  visible,
}: MemoryCardProps) {
  return (
    <div
      className={`memory-modal ${visible ? 'show' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Memory"
      onClick={onClose}
    >
      <div className="memory-card" onClick={(e) => e.stopPropagation()}>
        <PhotoFrame photoUrl={photoUrl} slotIndex={photoIndex as 0 | 1 | 2 | 3 | 4} variant="memory" className="!w-[120px]" />
        <p>{note}</p>
        <button type="button" className="memory-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
});
