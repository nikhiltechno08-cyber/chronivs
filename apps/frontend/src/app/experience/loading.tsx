'use client';

import { StoryLoadingScreen } from '@/features/experience-engine/components/StoryLoadingScreen';

/** Keeps create → preview continuous — same cinematic loader as Studio Generate. */
export default function ExperienceLoading() {
  return (
    <StoryLoadingScreen
      message="Weaving your photos into a cinematic story…"
      startProgress={70}
      maxProgress={94}
    />
  );
}
