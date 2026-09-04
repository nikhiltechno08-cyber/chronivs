'use client';

import { memo } from 'react';

import type { StudioPhoto } from '../../types';

type PhotoTileProps = {
  photo: StudioPhoto;
  isNew?: boolean;
  onRemove: (id: string) => void;
};

export const PhotoTile = memo(function PhotoTile({ photo, onRemove }: PhotoTileProps) {
  const status = photo.uploadStatus ?? (photo.secureUrl || photo.dataUrl ? 'complete' : 'queued');
  const progress = Math.max(0, Math.min(100, photo.uploadProgress ?? (status === 'complete' ? 100 : 0)));
  const displayUrl = photo.secureUrl || photo.dataUrl;
  const showBar = status === 'queued' || status === 'uploading' || status === 'error';
  const isBusy = status === 'queued' || status === 'uploading';

  return (
    <div className={`studio-photo-tile studio-photo-tile-enter`}>
      {displayUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={displayUrl} alt="Uploaded memory photo" />
      ) : (
        <div className="h-full w-full bg-[var(--studio-card)]" aria-hidden="true" />
      )}

      {isBusy && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[rgba(9,9,9,.35)]"
          aria-hidden="true"
        >
          <span
            className="h-5 w-5 animate-spin rounded-full border border-[rgba(255,255,255,.25)] border-t-[var(--studio-gold)]"
            aria-hidden="true"
          />
        </div>
      )}

      {status === 'error' && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-6 px-2 text-center text-[10px] leading-tight text-[#f0c4c0]"
          role="status"
        >
          {photo.uploadError || 'Upload failed'}
        </div>
      )}

      <button
        type="button"
        className="absolute top-1 right-1 flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-[rgba(9,9,9,.7)] text-white opacity-0 backdrop-blur-sm transition-opacity hover:opacity-100 group-hover:opacity-100 [.studio-photo-tile:hover_&]:opacity-100"
        onClick={() => onRemove(photo.id)}
        aria-label="Remove photo"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-[11px] w-[11px]" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      {showBar && (
        <div className="absolute right-2.5 bottom-2.5 left-2.5 h-[3px] overflow-hidden rounded-sm bg-[rgba(255,255,255,.15)]">
          <i
            className={`block h-full transition-[width] duration-150 ease-linear ${
              status === 'error' ? 'bg-[#e8a09a]' : 'bg-[var(--studio-gold)]'
            }`}
            style={{ width: `${status === 'error' ? 100 : progress}%` }}
          />
        </div>
      )}

      {isBusy && (
        <span className="pointer-events-none absolute right-2.5 bottom-5 text-[9px] tracking-wide text-[rgba(247,243,234,.85)]">
          {progress}%
        </span>
      )}
    </div>
  );
});

type PreviewCardProps = {
  emoji: string;
  title: string;
  subtitle: string;
  reveal?: boolean;
};

export const PreviewCard = memo(function PreviewCard({ emoji, title, subtitle, reveal }: PreviewCardProps) {
  return (
    <div className={`studio-phone-frame ${reveal ? 'reveal' : 'opacity-0'}`}>
      <div className="relative flex h-full w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-[26px] bg-[#0a0908]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 50% 20%, rgba(230,193,90,.28), transparent 60%)' }}
        />
        <span className="relative z-[1] text-[30px]" aria-hidden="true">
          {emoji}
        </span>
        <span className="studio-serif relative z-[1] px-5 text-center text-[15px] text-[var(--studio-white)] italic">
          {title}
        </span>
        <span className="studio-mono relative z-[1] text-[9px] tracking-[0.14em] text-[var(--studio-gold)] uppercase">
          {subtitle}
        </span>
      </div>
    </div>
  );
});
