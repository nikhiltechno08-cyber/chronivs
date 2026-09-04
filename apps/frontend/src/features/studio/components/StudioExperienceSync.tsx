'use client';

import { memo, useEffect, useRef, type ReactNode } from 'react';

import { ExperienceProvider, useExperience } from '@/features/experience-engine/context/ExperienceContext';
import { useCanonicalExperienceData } from '@/features/experience-engine/hooks/useExperienceData';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function asDurableId(value: string | undefined | null): string {
  return value && UUID_RE.test(value) ? value : '';
}

/**
 * Keeps ExperienceContext aligned with studio draft edits.
 * Preserves durable experienceId assigned by persistence bootstrap.
 */
const SyncBridge = memo(function SyncBridge({ children }: { children: ReactNode }) {
  const latest = useCanonicalExperienceData();
  const { experienceData, setExperienceData } = useExperience();
  const experienceIdRef = useRef(asDurableId(experienceData.experienceId));
  const durableLatest = asDurableId(latest.experienceId);
  const durableCurrent = asDurableId(experienceData.experienceId);
  if (durableCurrent) experienceIdRef.current = durableCurrent;
  else if (durableLatest) experienceIdRef.current = durableLatest;

  useEffect(() => {
    const experienceId = experienceIdRef.current || durableLatest || '';
    setExperienceData({
      ...latest,
      experienceId,
      metadata: {
        ...latest.metadata,
        createdAt: experienceData.metadata.createdAt || latest.metadata.createdAt,
        version: Math.max(experienceData.metadata.version || 1, latest.metadata.version || 1),
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync from studio snapshot only
  }, [latest, setExperienceData]);

  return <>{children}</>;
});

export const StudioExperienceSync = memo(function StudioExperienceSync({
  children,
}: {
  children: ReactNode;
}) {
  const initialData = useCanonicalExperienceData();
  return (
    <ExperienceProvider initialData={initialData}>
      <SyncBridge>{children}</SyncBridge>
    </ExperienceProvider>
  );
});
