'use client';

import { memo, useEffect, useState } from 'react';

import { LOADING_MESSAGES } from '@/features/studio/constants/occasions';
import { LoadingOverlay } from '@/features/studio/components/overlays/LoadingOverlay';
import '@/features/studio/studio.css';

type StoryLoadingScreenProps = {
  /** Override rotating messages with a single line. */
  message?: string;
  /** Where the bar starts (0–100). */
  startProgress?: number;
  /** Soft ceiling while waiting (never hits 100 until unmount). */
  maxProgress?: number;
};

/**
 * Shared cinematic loader for Generate → /experience → public /e.
 * Instant (no fade-in) so route handoffs stay black instead of flashing blank UI.
 */
export const StoryLoadingScreen = memo(function StoryLoadingScreen({
  message,
  startProgress = 12,
  maxProgress = 92,
}: StoryLoadingScreenProps) {
  const [progress, setProgress] = useState(startProgress);
  const [activeMessage, setActiveMessage] = useState<string>(
    message ?? LOADING_MESSAGES[0]!,
  );

  useEffect(() => {
    if (message) {
      setActiveMessage(message);
      return;
    }
    let index = 0;
    const id = window.setInterval(() => {
      index = (index + 1) % LOADING_MESSAGES.length;
      setActiveMessage(LOADING_MESSAGES[index]!);
    }, 900);
    return () => window.clearInterval(id);
  }, [message]);

  useEffect(() => {
    const startedAt = Date.now();
    const id = window.setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 4500;
      // Ease toward maxProgress — feels continuous with studio generate bar.
      const next = startProgress + (1 - Math.exp(-elapsed * 1.8)) * (maxProgress - startProgress);
      setProgress(Math.min(maxProgress, next));
    }, 40);
    return () => window.clearInterval(id);
  }, [maxProgress, startProgress]);

  return <LoadingOverlay visible instant message={activeMessage} progress={progress} />;
});
