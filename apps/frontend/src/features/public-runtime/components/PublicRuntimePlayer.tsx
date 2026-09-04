'use client';

import { useRouter } from 'next/navigation';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { toExperienceInputData } from '@/features/experience-engine/adapters/experience-data-adapter';
import {
  getTemplateAmbientMusic,
  unlockExperienceAudio,
} from '@/features/experience-engine/config/ambient-music';
import { ExperienceProvider } from '@/features/experience-engine/context/ExperienceContext';
import { resolveTemplateRenderer } from '@/features/experience-engine/renderers/templateRenderers';
import type { ExperienceTemplateId } from '@/features/experience-engine/types';
import type { ExperienceData } from '@/types/experience';

import { PublicRuntimeProvider } from '../context/PublicRuntimeContext';
import { usePublicAnalytics } from '../hooks/usePublicAnalytics';
import { TapToBeginOverlay } from './TapToBeginOverlay';

type PublicRuntimePlayerProps = {
  templateId: ExperienceTemplateId;
  experienceData: ExperienceData;
  publicUuid: string;
  musicUrl?: string | null;
  showCreateCta?: boolean;
};

/**
 * Recipient runtime — no CheckoutProvider, no studio sync, no editor chrome.
 * Always restarts from Scene 1 on refresh (no playback persistence).
 */
export const PublicRuntimePlayer = memo(function PublicRuntimePlayer({
  templateId,
  experienceData,
  publicUuid,
  musicUrl,
  showCreateCta = true,
}: PublicRuntimePlayerProps) {
  const router = useRouter();
  const [begun, setBegun] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const { trackCompleted, trackReplay } = usePublicAnalytics(publicUuid);

  const Renderer = resolveTemplateRenderer(templateId);
  const flatData = useMemo(() => toExperienceInputData(experienceData), [experienceData]);
  const templateAmbient = getTemplateAmbientMusic(templateId);
  // Template owns Perfect BGM — don't also loop a separate upload track on top.
  const externalBgm = templateAmbient ? null : musicUrl;

  // Preload cover / first gallery image for faster first paint
  useEffect(() => {
    const first =
      experienceData.media.coverPhoto?.url ||
      experienceData.media.gallery[0]?.url ||
      null;
    if (!first || !first.startsWith('https://')) return;
    const img = new Image();
    img.decoding = 'async';
    img.src = first;
  }, [experienceData.media.coverPhoto?.url, experienceData.media.gallery]);

  // Attempt silent unlock; if external BGM exists and autoplay blocked, keep Tap to Begin
  useEffect(() => {
    if (!externalBgm) {
      setBegun(true);
      setAudioUnlocked(true);
      return;
    }
    let cancelled = false;
    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = externalBgm;
    audio.loop = true;
    audio.volume = 0.35;
    void audio
      .play()
      .then(() => {
        if (cancelled) return;
        audio.pause();
        audio.currentTime = 0;
        setAudioUnlocked(true);
        setBegun(true);
      })
      .catch(() => {
        if (cancelled) return;
        setAudioUnlocked(false);
        setBegun(false);
      });
    return () => {
      cancelled = true;
      audio.pause();
    };
  }, [externalBgm]);

  const handleBegin = useCallback(() => {
    setBegun(true);
    setAudioUnlocked(true);
    unlockExperienceAudio();
    if (!externalBgm) return;
    const audio = new Audio(externalBgm);
    audio.loop = true;
    audio.volume = 0.35;
    void audio.play().catch(() => {
      // Still begin the story — music is optional.
    });
    (window as unknown as { __chronivsBgm?: HTMLAudioElement }).__chronivsBgm = audio;
  }, [externalBgm]);

  const handleCreateOwn = useCallback(() => {
    router.push('/studio?new=1');
  }, [router]);

  const runtimeConfig = useMemo(
    () => ({
      showCreateOwnCta: showCreateCta,
      onCreateOwn: showCreateCta ? handleCreateOwn : undefined,
      onReplay: trackReplay,
      onExperienceComplete: trackCompleted,
    }),
    [handleCreateOwn, showCreateCta, trackCompleted, trackReplay],
  );

  if (!Renderer) {
    return (
      <div
        role="alert"
        className="flex min-h-dvh items-center justify-center bg-[#0b0407] px-6 text-center text-[#f7ecdd]"
      >
        <p>This experience template is unavailable.</p>
      </div>
    );
  }

  return (
    <PublicRuntimeProvider value={runtimeConfig}>
      <ExperienceProvider initialData={experienceData}>
        <div className="relative min-h-dvh bg-[#0b0407]">
          <TapToBeginOverlay visible={!begun && !audioUnlocked} onBegin={handleBegin} />
          {(begun || audioUnlocked) && (
            <Renderer
              experienceData={experienceData}
              data={flatData}
              templateId={templateId}
              mode="published"
            />
          )}
        </div>
      </ExperienceProvider>
    </PublicRuntimeProvider>
  );
});
