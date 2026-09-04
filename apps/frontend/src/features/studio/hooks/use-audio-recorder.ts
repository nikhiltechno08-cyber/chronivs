'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useStudioStore } from '../store/studio-store';
import type { AudioSource, StudioAudio } from '../types';
import { formatTime } from '../utils';

const WAVE_BAR_COUNT = 28;

type UseAudioRecorderOptions = {
  onRecorded?: () => void;
  onUploaded?: () => void;
};

function revokeIfBlobUrl(url: string | null | undefined) {
  if (url && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      /* ignore */
    }
  }
}

export function useAudioRecorder(options: UseAudioRecorderOptions = {}) {
  const setAudio = useStudioStore((s) => s.setAudio);
  const audio = useStudioStore((s) => s.audio);

  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [waveHeights, setWaveHeights] = useState<number[]>(() => Array(WAVE_BAR_COUNT).fill(6));
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0);
  const [micNote, setMicNote] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const playTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);
  const objectUrlRef = useRef<string | null>(null);

  const cleanupRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (audioCtxRef.current) {
      void audioCtxRef.current.close();
    }
    mediaRecorderRef.current = null;
    streamRef.current = null;
    audioCtxRef.current = null;
    analyserRef.current = null;
    setWaveHeights(Array(WAVE_BAR_COUNT).fill(6));
  }, []);

  const applyAudio = useCallback(
    (url: string, source: AudioSource, dur: number) => {
      revokeIfBlobUrl(objectUrlRef.current);
      objectUrlRef.current = url.startsWith('blob:') ? url : null;

      const entry: StudioAudio = { url, source, duration: dur };
      setAudio(entry);
      setDuration(dur);

      if (audioElRef.current) {
        audioElRef.current.pause();
      }
      audioElRef.current = new Audio(url);
      setIsPlaying(false);
      setPlayProgress(0);

      if (source === 'recorded') options.onRecorded?.();
      else options.onUploaded?.();
    },
    [options, setAudio],
  );

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      setIsRecording(true);
      setMicNote('');

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        applyAudio(URL.createObjectURL(blob), 'recorded', elapsedRef.current);
        cleanupRecording();
      };
      recorder.start();

      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const startTime = Date.now();

      timerRef.current = setInterval(() => {
        elapsedRef.current = (Date.now() - startTime) / 1000;
        setDuration(elapsedRef.current);
      }, 200);

      const draw = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        setWaveHeights(
          Array.from({ length: WAVE_BAR_COUNT }, (_, i) => {
            const v = dataArray[i % dataArray.length] ?? 0;
            return Math.max(6, (v / 255) * 36);
          }),
        );
        rafRef.current = requestAnimationFrame(draw);
      };
      draw();
    } catch {
      setMicNote('Microphone access was denied — you can upload an audio file instead.');
    }
  }, [applyAudio, cleanupRecording]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      cleanupRecording();
    }
  }, [cleanupRecording]);

  const toggleRecord = useCallback(() => {
    if (isRecording) stopRecording();
    else void startRecording();
  }, [isRecording, startRecording, stopRecording]);

  const uploadFile = useCallback(
    (file: File) => {
      const url = URL.createObjectURL(file);
      const temp = new Audio(url);
      temp.addEventListener('loadedmetadata', () => {
        applyAudio(url, 'uploaded', temp.duration);
      });
    },
    [applyAudio],
  );

  const togglePlayback = useCallback(() => {
    const el = audioElRef.current;
    if (!el || !audio) return;

    if (el.paused) {
      void el.play();
      setIsPlaying(true);
      playTickRef.current = setInterval(() => {
        if (el.paused || !el.duration) return;
        setPlayProgress((el.currentTime / el.duration) * 100);
      }, 150);
      el.onended = () => {
        setIsPlaying(false);
        setPlayProgress(0);
        if (playTickRef.current) clearInterval(playTickRef.current);
      };
    } else {
      el.pause();
      setIsPlaying(false);
      if (playTickRef.current) clearInterval(playTickRef.current);
    }
  }, [audio]);

  const clearAudio = useCallback(() => {
    if (playTickRef.current) clearInterval(playTickRef.current);
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current = null;
    }
    revokeIfBlobUrl(objectUrlRef.current);
    objectUrlRef.current = null;
    setAudio(null);
    setIsPlaying(false);
    setPlayProgress(0);
    setDuration(0);
  }, [setAudio]);

  useEffect(() => {
    return () => {
      cleanupRecording();
      if (playTickRef.current) clearInterval(playTickRef.current);
      if (audioElRef.current) {
        audioElRef.current.pause();
        audioElRef.current = null;
      }
      revokeIfBlobUrl(objectUrlRef.current);
      objectUrlRef.current = null;
    };
  }, [cleanupRecording]);

  useEffect(() => {
    if (audio?.url && !audioElRef.current) {
      audioElRef.current = new Audio(audio.url);
      setDuration(audio.duration);
    }
  }, [audio]);

  return {
    audio,
    isRecording,
    duration,
    formattedDuration: formatTime(duration),
    formattedPlayDuration: formatTime(audio?.duration ?? duration),
    waveHeights,
    isPlaying,
    playProgress,
    micNote,
    toggleRecord,
    uploadFile,
    togglePlayback,
    clearAudio,
  };
}
