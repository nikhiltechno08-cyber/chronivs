'use client';

import { useRouter } from 'next/navigation';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { CheckoutProvider, CheckoutSheet } from '@/features/checkout';
import { useStudioStore } from '@/features/studio/store/studio-store';
import { loadSessionMedia } from '@/features/studio/utils/session-media';
import { completeExperiencePublish } from '@/services/publish.service';
import type { ExperienceData } from '@/types/experience';

import { toExperienceInputData } from '../adapters/experience-data-adapter';
import { ExperienceProvider, useExperience } from '../context/ExperienceContext';
import { useCanonicalExperienceData } from '../hooks/useExperienceData';
import { resolveTemplateRenderer } from '../renderers/templateRenderers';
import type { ExperienceViewMode } from '../shared/cinematic-ending';
import type { ExperienceTemplateId } from '../types';
import { StoryLoadingScreen } from './StoryLoadingScreen';

function readPreviewBridgeFlag(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem('chronivs-preview-loading') === '1';
  } catch {
    return false;
  }
}

function clearPreviewBridgeFlag() {
  try {
    sessionStorage.removeItem('chronivs-preview-loading');
  } catch {
    /* ignore */
  }
}

/** Rehydrate Cloudinary photos into the studio store for preview → publish. */
function useHydrateSessionMedia(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const studio = useStudioStore.getState();
    if (studio.photos.length > 0) return;

    const session = loadSessionMedia();
    if (!session?.photos?.length) return;
    studio.replacePhotos(session.photos);
    if (!studio.audio && session.audio) {
      studio.setAudio(session.audio);
    }
  }, [enabled]);
}

/**
 * Keeps the cinematic loader visible from Generate until the template chunk has
 * mounted — avoids flashing Step 6 while /experience compiles.
 */
function useGenerateHandoffCover(enabled: boolean) {
  const [cover, setCover] = useState(false);
  const [handoffActive, setHandoffActive] = useState(false);
  const dismissedRef = useRef(false);

  const dismissHandoff = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setCover(false);
    setHandoffActive(false);
    clearPreviewBridgeFlag();
    if (useStudioStore.getState().phase === 'loading') {
      useStudioStore.getState().setPhase('flow');
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (readPreviewBridgeFlag()) {
      setCover(true);
      setHandoffActive(true);
    }
  }, [enabled]);

  return { cover, handoffActive, dismissHandoff };
}

type ExperiencePlayerProps = {
  templateId: ExperienceTemplateId;
  mode?: ExperienceViewMode;
  /** Frozen published document — skips studio/session sync when provided. */
  initialExperienceData?: ExperienceData;
};

function ExperienceRendererHost({
  templateId,
  mode,
  lockedData,
  onTemplateReady,
}: {
  templateId: ExperienceTemplateId;
  mode: ExperienceViewMode;
  lockedData?: ExperienceData;
  onTemplateReady?: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const { experienceData, setExperienceData } = useExperience();
  const latest = useCanonicalExperienceData();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (lockedData) {
      setExperienceData(lockedData);
      return;
    }
    setExperienceData(latest);
  }, [latest, lockedData, setExperienceData]);

  if (!mounted) {
    return null;
  }

  const Renderer = resolveTemplateRenderer(templateId);
  if (!Renderer) {
    return (
      <div role="alert" className="flex min-h-dvh items-center justify-center bg-[#0b0407] text-[#f7ecdd]">
        <p>Experience template not found.</p>
      </div>
    );
  }

  const data = toExperienceInputData(experienceData);

  return (
    <>
      <Renderer
        experienceData={experienceData}
        data={data}
        templateId={templateId}
        mode={mode}
        onTemplateReady={onTemplateReady}
      />
      {mode === 'preview' ? <CheckoutSheetHost /> : null}
    </>
  );
}

function CheckoutSheetHost() {
  const router = useRouter();

  const handlePaymentReady = useCallback(
    async (experienceUuid: string) => {
      try {
        await completeExperiencePublish(experienceUuid, router);
      } catch {
        // Payment succeeded — publish can be retried from checkout.
      }
    },
    [router],
  );

  return <CheckoutSheet onPaymentReady={(id) => void handlePaymentReady(id)} />;
}

/**
 * Studio / preview player — includes checkout for preview mode only.
 * Public recipients use PublicRuntimePlayer instead.
 */
export const ExperiencePlayer = memo(function ExperiencePlayer({
  templateId,
  mode = 'preview',
  initialExperienceData,
}: ExperiencePlayerProps) {
  const isPreview = mode === 'preview' && !initialExperienceData;
  useHydrateSessionMedia(isPreview);
  const { cover, handoffActive, dismissHandoff } = useGenerateHandoffCover(isPreview);
  const studioData = useCanonicalExperienceData();
  const initialData = initialExperienceData ?? studioData;

  return (
    <CheckoutProvider>
      {cover ? (
        <StoryLoadingScreen
          message="Weaving your photos into a cinematic story…"
          startProgress={82}
          maxProgress={98}
        />
      ) : null}
      <ExperienceProvider initialData={initialData}>
        <ExperienceRendererHost
          templateId={templateId}
          mode={mode}
          lockedData={initialExperienceData}
          onTemplateReady={handoffActive ? dismissHandoff : undefined}
        />
      </ExperienceProvider>
    </CheckoutProvider>
  );
});
