'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { CTAButton } from '../components/CTAButton';
import { SceneShell } from '../components/SceneShell';
import type { SceneComponentProps } from '../types';

export const VinylScene = memo(function VinylScene({ data, onNext, isActive }: SceneComponentProps) {
  const [playing, setPlaying] = useState(false);
  const [ctaStep, setCtaStep] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const waveStyles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, k) => ({
        animationDelay: `${k * 0.07}s`,
        animationDuration: `${0.8 + ((k * 17) % 70) / 100}s`,
      })),
    [],
  );

  useEffect(() => {
    const audio = audioRef.current;

    if (!isActive) {
      setPlaying(false);
      setCtaStep(0);
      audio?.pause();
      return;
    }

    return () => {
      audio?.pause();
    };
  }, [isActive]);

  const startPlayback = useCallback(() => {
    if (playing) return;
    setPlaying(true);
    if (data.audioUrl && audioRef.current) {
      audioRef.current.play().catch(() => undefined);
    }
    window.setTimeout(() => setCtaStep(1), 1400);
  }, [playing, data.audioUrl]);

  const handleCta = useCallback(() => {
    if (ctaStep === 0) {
      startPlayback();
      return;
    }
    onNext();
  }, [ctaStep, startPlayback, onNext]);

  if (!isActive) return null;

  return (
    <SceneShell id="scene-wife-vinyl">
      {data.audioUrl && <audio ref={audioRef} src={data.audioUrl} preload="auto" />}
      <div className="aw-eyebrow">THE SOUND OF MY HEART</div>
      <div className="aw-vinyl-wrap">
        <div className={`aw-turntable ${playing ? 'playing' : ''}`}>
          <div className={`aw-record ${playing ? 'spin' : ''}`} />
          <div className="aw-tonearm" />
        </div>
        <div className={`aw-waves2 ${playing ? 'playing' : ''}`}>
          {playing &&
            waveStyles.map((style, k) => <span key={k} style={style} />)}
        </div>
        <div className="aw-audio-note">
          🎵 Our Song
          {data.audioUrl ? '' : ' — add your favorite track to play it here'}
        </div>
      </div>
      <CTAButton show onClick={handleCta} small>
        {ctaStep === 0 ? 'Listen To Our Promises' : 'Listen To Our Promises →'}
      </CTAButton>
    </SceneShell>
  );
});
