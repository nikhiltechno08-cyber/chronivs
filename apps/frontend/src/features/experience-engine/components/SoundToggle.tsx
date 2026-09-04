'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { AUDIO_UNLOCK_EVENT } from '../config/ambient-music';
import './sound-toggle.css';

type SoundToggleProps = {
  className?: string;
  /** Start muted (default false — matches birthday girlfriend). */
  defaultMuted?: boolean;
  /** Ambient track URL from centralized assets (e.g. `Assets.music.perfect`). */
  src?: string;
  volume?: number;
};

export const SoundToggle = memo(function SoundToggle({
  className = '',
  defaultMuted = false,
  src,
  volume = 0.42,
}: SoundToggleProps) {
  const [muted, setMuted] = useState(defaultMuted);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  useEffect(() => {
    if (!src) return;

    const audio = new Audio(src);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = volume;
    audio.muted = mutedRef.current;
    audioRef.current = audio;

    const tryPlay = () => {
      if (mutedRef.current) return;
      void audio.play().catch(() => {
        // Browser blocked autoplay — icon shows muted; tap the icon to start.
        setMuted(true);
      });
    };

    tryPlay();

    const onUnlock = () => {
      setMuted(false);
      mutedRef.current = false;
      audio.muted = false;
      void audio.play().catch(() => undefined);
    };

    window.addEventListener(AUDIO_UNLOCK_EVENT, onUnlock);

    return () => {
      window.removeEventListener(AUDIO_UNLOCK_EVENT, onUnlock);
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audioRef.current = null;
    };
  }, [src, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = muted;
    if (!muted) {
      void audio.play().catch(() => undefined);
    }
  }, [muted]);

  const toggle = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      const audio = audioRef.current;
      if (audio) {
        audio.muted = next;
        if (!next) {
          void audio.play().catch(() => undefined);
        }
      }
      return next;
    });
  }, []);

  return (
    <button
      id="soundToggle"
      type="button"
      className={`exp-sound-toggle ${className}`.trim()}
      aria-label={muted ? 'Unmute sound' : 'Mute sound'}
      onClick={toggle}
      data-muted={muted}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        {muted ? (
          <>
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </>
        ) : (
          <>
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <path d="M15.5 8.5a5 5 0 010 7" />
            <path d="M18.5 5.5a9 9 0 010 13" />
          </>
        )}
      </svg>
    </button>
  );
});
