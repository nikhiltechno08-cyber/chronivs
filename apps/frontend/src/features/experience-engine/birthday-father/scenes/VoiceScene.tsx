'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { CTAButton } from '../components/CTAButton';
import { SceneShell } from '../components/SceneShell';
import type { SceneComponentProps } from '../types';

export const VoiceScene = memo(function VoiceScene({ data, onNext, isActive }: SceneComponentProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [showCta, setShowCta] = useState(false);

  const handleEnded = useCallback(() => setPlaying(false), []);

  useEffect(() => {
    if (!isActive) {
      setPlaying(false);
      setShowCta(false);
      audioRef.current?.pause();
      return;
    }
    const t = window.setTimeout(() => setShowCta(true), 3500);
    return () => {
      clearTimeout(t);
      const audio = audioRef.current;
      if (audio) {
        audio.removeEventListener('ended', handleEnded);
        audio.pause();
      }
    };
  }, [handleEnded, isActive]);

  if (!isActive) return null;

  const togglePlay = async () => {
    if (!data.audioUrl) {
      setPlaying((p) => !p);
      setShowCta(true);
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(data.audioUrl);
      audioRef.current.addEventListener('ended', handleEnded);
    }

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }

    try {
      await audioRef.current.play();
      setPlaying(true);
      setShowCta(true);
    } catch {
      setPlaying(false);
    }
  };

  return (
    <SceneShell theme="light" id="scene-father-voice">
      <span className="fb-chapter">Chapter Seven — The Voice</span>
      <div className="fb-voice-card">
        <div className="fb-mic-wrap" aria-hidden="true">
          <span className="fb-mic-ring" />
          <span className="fb-mic-ring" />
          <span className="fb-mic-ring" />
          <div className="fb-mic">🎙</div>
        </div>

        <div className={`fb-wave ${playing ? 'live' : ''}`} aria-hidden="true">
          {Array.from({ length: 18 }, (_, i) => (
            <i key={i} style={{ animationDelay: `${(i % 6) * 0.1}s` }} />
          ))}
        </div>

        <p className="fb-sub fb-sub-light" style={{ fontSize: 16, maxWidth: 360 }}>
          Your voice on the phone still means everything is going to be okay.
        </p>

        <button
          type="button"
          className="fb-play"
          onClick={() => void togglePlay()}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>

      <CTAButton show={showCta} onClick={onNext} className="fb-cta-light">
        Read My Letter
      </CTAButton>
    </SceneShell>
  );
});
