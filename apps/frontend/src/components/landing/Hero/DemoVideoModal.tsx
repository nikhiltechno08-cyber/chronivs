'use client';

import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { Assets } from '@/config/assets';

import './demo-video-modal.css';

type DemoVideoModalProps = {
  open: boolean;
  onClose: () => void;
};

export function DemoVideoModal({ open, onClose }: DemoVideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (open) {
      const playPromise = video.play();
      if (playPromise) playPromise.catch(() => undefined);
      return;
    }

    video.pause();
    video.currentTime = 0;
  }, [open]);

  const handleBackdropClick = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="landing-demo-video-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Chronivs demo video"
      onClick={handleBackdropClick}
    >
      <div
        className="landing-demo-video-shell"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="landing-demo-video-close"
          aria-label="Close demo video"
          onClick={onClose}
        >
          <span aria-hidden="true">×</span>
        </button>

        <div className="landing-demo-video-header">
          <span className="landing-demo-video-label">Demo</span>
          <p className="landing-demo-video-title">See Chronivs in action</p>
        </div>

        <div className="landing-demo-video-frame">
          <video
            ref={videoRef}
            className="landing-demo-video-player"
            src={Assets.hero.demoVideo}
            controls
            playsInline
            preload="metadata"
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
