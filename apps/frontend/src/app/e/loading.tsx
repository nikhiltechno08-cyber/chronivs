'use client';

import { StoryLoadingScreen } from '@/features/experience-engine/components/StoryLoadingScreen';

/** Public share link — same cinematic loader while the story opens. */
export default function PublicExperienceLoading() {
  return (
    <StoryLoadingScreen
      message="Opening your story…"
      startProgress={18}
      maxProgress={88}
    />
  );
}
