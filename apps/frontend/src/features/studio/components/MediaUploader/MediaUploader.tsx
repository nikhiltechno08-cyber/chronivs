'use client';

import { memo, useRef } from 'react';

import { MAX_PHOTOS } from '../../constants/occasions';
import { usePhotoUpload } from '../../hooks/use-photo-upload';
import type { StudioPhoto } from '../../types';
import { ContinueButton, PanelActions } from '../ContinueButton';
import { PanelHead } from '../Hero';
import { PhotoTile } from '../PreviewCard';

type MediaUploaderProps = {
  onContinue: () => void;
  onSkip: () => void;
  onToast: (message: string) => void;
};

export const MediaUploader = memo(function MediaUploader({ onContinue, onSkip, onToast }: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    photos,
    isDragging,
    lastAddedId,
    handleFiles,
    removePhoto,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
    hasUploading,
  } = usePhotoUpload({
    onLimitReached: () => onToast('You can add up to 5 photos'),
    onPartialAdd: (remaining) => onToast(`Only ${remaining} more photo(s) could be added`),
    onValidationError: (message) => onToast(message),
    onUploadError: (message) => onToast(message),
  });

  return (
    <>
      <PanelHead
        eyebrow="The memories"
        title="Choose your favorite memories."
        description="Up to 5 photos that tell your story together."
      />

      <div
        role="button"
        tabIndex={0}
        className={`studio-dropzone ${isDragging ? 'dragging' : ''}`}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        aria-label="Upload photos"
      >
        <div className="mx-auto mb-[18px] h-11 w-11 text-[var(--studio-gold)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 16V4M12 4l-4.5 4.5M12 4l4.5 4.5" />
            <path d="M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3" />
          </svg>
        </div>
        <h3 className="studio-serif text-[19px] font-normal text-[var(--studio-white)]">Drag & drop your photos</h3>
        <p className="mt-2 text-[13.5px] text-[var(--studio-gray)]">or</p>
        <span className="mt-5 inline-block rounded-full border border-[var(--studio-line)] px-[26px] py-[11px] text-[13px] text-[var(--studio-white)] transition-all hover:border-[var(--studio-gold)] hover:text-[var(--studio-gold)]">
          Choose Photos
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          multiple
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            if (e.target.files) void handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {photos.length > 0 && (
        <div className="studio-photo-masonry mt-[26px] grid grid-cols-3 gap-3">
          {photos.map((photo: StudioPhoto) => (
            <PhotoTile
              key={photo.id}
              photo={photo}
              isNew={photo.id === lastAddedId}
              onRemove={removePhoto}
            />
          ))}
        </div>
      )}

      <p className="mt-4 text-center text-xs text-[var(--studio-gray-faint)]">
        You can add up to {MAX_PHOTOS} photos · {photos.length}/{MAX_PHOTOS} added
      </p>

      <PanelActions footer={<ContinueButton variant="ghost" onClick={onSkip}>Skip for now</ContinueButton>}>
        <ContinueButton
          onClick={() => {
            if (hasUploading) {
              onToast('Please wait for photos to finish uploading');
              return;
            }
            onContinue();
          }}
        />
      </PanelActions>
    </>
  );
});
