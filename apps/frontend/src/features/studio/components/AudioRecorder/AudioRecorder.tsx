'use client';

import { memo, useRef } from 'react';

import { useAudioRecorder } from '../../hooks/use-audio-recorder';
import { ContinueButton, PanelActions } from '../ContinueButton';
import { PanelHead } from '../Hero';

type AudioRecorderProps = {
  onContinue: () => void;
  onSkip: () => void;
  onToast: (message: string) => void;
};

export const AudioRecorder = memo(function AudioRecorder({ onContinue, onSkip, onToast }: AudioRecorderProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const {
    audio,
    isRecording,
    formattedDuration,
    formattedPlayDuration,
    waveHeights,
    isPlaying,
    playProgress,
    micNote,
    toggleRecord,
    uploadFile,
    togglePlayback,
  } = useAudioRecorder({
    onRecorded: () => onToast('Voice message recorded'),
    onUploaded: () => onToast('Audio uploaded'),
  });

  return (
    <>
      <PanelHead
        eyebrow="Your voice"
        title="Want them to hear your voice?"
        description={'Nothing says "I mean this" like hearing it, in your own voice.'}
      />

      <div className="studio-voice-stage">
        <div className={`studio-mic-orb ${isRecording ? 'recording' : ''}`} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-[34px] w-[34px] text-[var(--studio-gold)]">
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 10a7 7 0 0014 0M12 19v3" />
          </svg>
        </div>

        <div className={`studio-wave-row ${isRecording ? 'live' : ''}`} aria-hidden="true">
          {waveHeights.map((h, i) => (
            <i key={i} style={{ height: `${h}px` }} />
          ))}
        </div>

        <div className="studio-mono text-[15px] tracking-[0.04em] text-[var(--studio-white)]" aria-live="polite">
          {formattedDuration}
        </div>

        {audio && (
          <div className="studio-player-row" role="group" aria-label="Audio preview">
            <button
              type="button"
              className="flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full bg-[var(--studio-gold)] text-[#0a0a0a]"
              onClick={togglePlayback}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3" aria-hidden="true">
                  <rect x="6" y="5" width="4" height="14" />
                  <rect x="14" y="5" width="4" height="14" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <div className="h-[3px] flex-1 overflow-hidden rounded-sm bg-[var(--studio-line)]">
              <i className="block h-full bg-[var(--studio-gold)] transition-[width]" style={{ width: `${playProgress}%` }} />
            </div>
            <span className="studio-mono text-[11.5px] text-[var(--studio-gray)]">{formattedPlayDuration}</span>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3.5">
          <ContinueButton onClick={toggleRecord}>{isRecording ? 'Stop' : 'Record'}</ContinueButton>
          <ContinueButton variant="secondary" onClick={() => fileRef.current?.click()}>
            Upload Audio
          </ContinueButton>
          <input
            ref={fileRef}
            type="file"
            accept="audio/*"
            hidden
            aria-hidden="true"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadFile(file);
              e.target.value = '';
            }}
          />
        </div>

        {micNote && (
          <p className="max-w-[320px] text-center text-[12.5px] text-[var(--studio-gray-faint)]">{micNote}</p>
        )}
      </div>

      <PanelActions footer={<ContinueButton variant="ghost" onClick={onSkip}>Skip for now</ContinueButton>}>
        <ContinueButton onClick={onContinue} />
      </PanelActions>
    </>
  );
});
