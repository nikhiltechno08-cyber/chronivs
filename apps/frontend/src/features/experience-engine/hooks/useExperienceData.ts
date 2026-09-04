'use client';

import { useEffect, useMemo, useState } from 'react';

import { useStudioStore } from '@/features/studio/store/studio-store';
import { loadSessionMedia } from '@/features/studio/utils/session-media';
import type { StudioAudio, StudioPhoto } from '@/features/studio/types';
import { resolveTemplateId } from '@/features/experience-engine/core/template-registry';

import {
  buildExperienceDataFromStudio,
  toExperienceInputData,
} from '../adapters/experience-data-adapter';
import { useOptionalExperience } from '../context/ExperienceContext';
import type { ExperienceInputData } from '../types';
import type { ExperienceData } from '@/types/experience';

/** Beautiful gradient fallbacks when user uploads fewer than 5 photos */
export const FALLBACK_PHOTO_GRADIENTS = [
  'linear-gradient(150deg, #caa08f, #8f5a56 55%, #5c2f3a)',
  'linear-gradient(150deg, #b8907a, #7a4a52 55%, #4a2535)',
  'linear-gradient(150deg, #d4a896, #9a6b62 55%, #6b3540)',
  'linear-gradient(150deg, #c49a88, #855a50 55%, #553040)',
  'linear-gradient(150deg, #e0b8a8, #a07068 55%, #704048)',
] as const;

type SessionMediaSnapshot = {
  photos: StudioPhoto[];
  audio: StudioAudio | null;
} | null;

/**
 * Build the canonical ExperienceData document from studio / session bridge.
 * Templates and preview must not read studio/session directly — use this.
 */
export function useCanonicalExperienceData(): ExperienceData {
  const senderName = useStudioStore((s) => s.senderName);
  const receiverName = useStudioStore((s) => s.receiverName);
  const specialDate = useStudioStore((s) => s.specialDate);
  const customMessage = useStudioStore((s) => s.customMessage);
  const storePhotos = useStudioStore((s) => s.photos);
  const audio = useStudioStore((s) => s.audio);
  const occasion = useStudioStore((s) => s.occasion);
  const relationship = useStudioStore((s) => s.relationship);
  const templateConfig = useStudioStore((s) => s.templateConfig);
  const generatedExperience = useStudioStore((s) => s.generatedExperience);

  const [sessionMedia, setSessionMedia] = useState<SessionMediaSnapshot>(null);

  useEffect(() => {
    setSessionMedia(loadSessionMedia());
  }, []);

  return useMemo(() => {
    const photos = storePhotos.length > 0 ? storePhotos : (sessionMedia?.photos ?? []);
    const resolvedAudio = audio ?? sessionMedia?.audio ?? null;
    const templateId =
      generatedExperience?.templateId ??
      templateConfig.templateId ??
      resolveTemplateId(occasion, relationship) ??
      '';

    return buildExperienceDataFromStudio({
      experienceId: generatedExperience?.id ?? '',
      occasion,
      relationship,
      templateId,
      senderName,
      receiverName,
      specialDate,
      customMessage,
      photos,
      audio: resolvedAudio,
    });
  }, [
    audio,
    customMessage,
    generatedExperience?.id,
    generatedExperience?.templateId,
    occasion,
    receiverName,
    relationship,
    senderName,
    sessionMedia,
    specialDate,
    storePhotos,
    templateConfig.templateId,
  ]);
}

/**
 * Flat runtime view for existing template scenes.
 * ALWAYS derived from ExperienceData (context preferred, else canonical builder).
 */
export function useExperienceData(overrides?: Partial<ExperienceInputData>): ExperienceInputData {
  const ctx = useOptionalExperience();
  const built = useCanonicalExperienceData();
  const experienceData = ctx?.experienceData ?? built;

  return useMemo(() => {
    const derived = toExperienceInputData(experienceData);
    if (!overrides) return derived;
    return {
      ...derived,
      ...overrides,
      photos: overrides.photos ?? derived.photos,
    };
  }, [experienceData, overrides]);
}
