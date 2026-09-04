'use client';

import { memo } from 'react';

type StarTraitModalProps = {
  label: string;
  note: string;
  visible: boolean;
  onClose: () => void;
};

export const StarTraitModal = memo(function StarTraitModal({
  label,
  note,
  visible,
  onClose,
}: StarTraitModalProps) {
  return (
    <div
      className={`star-modal ${visible ? 'show' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={onClose}
    >
      <div className="star-modal-card" onClick={(e) => e.stopPropagation()}>
        <span className="star-modal-label">{label}</span>
        <p className="star-modal-note serif">{note}</p>
        <button type="button" className="memory-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
});
