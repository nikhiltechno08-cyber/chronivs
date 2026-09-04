'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

import { useOptionalCheckout } from '@/features/checkout';
import { useStudioStore } from '@/features/studio/store/studio-store';
import { clearSessionMedia } from '@/features/studio/utils/session-media';
import { OCCASION_CONFIG, OCCASIONS } from '@/features/studio/constants/occasions';
import type { OccasionKey } from '@/features/studio/types';
import {
  formatPublishErrors,
  runPublishValidationPipeline,
  type PublishValidationIssue,
} from '@/services/publishValidator';

import { getTemplateDefinition } from '../../core/template-registry';
import type { ExperienceTemplateId } from '../../types';

/** Shared preview-mode actions for the cinematic ending. */
export function useEndingActions(templateId: ExperienceTemplateId) {
  const router = useRouter();
  const checkout = useOptionalCheckout();
  const occasion = useStudioStore((s) => s.occasion);
  const relationship = useStudioStore((s) => s.relationship);
  const generatedExperience = useStudioStore((s) => s.generatedExperience);

  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<PublishValidationIssue[]>([]);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const goHome = useCallback(() => {
    // Leaving the preview flow — drop ephemeral session media cache.
    clearSessionMedia();
    router.push('/');
  }, [router]);

  const openCheckout = useCallback(async () => {
    if (!checkout) {
      router.push('/studio?new=1');
      return;
    }

    setIsValidating(true);
    setValidationErrors([]);
    setValidationMessage(null);

    try {
      const result = await runPublishValidationPipeline({
        stage: 'pre_publish',
        experienceId: generatedExperience?.id ?? null,
      });

      if (!result.valid) {
        setValidationErrors(result.errors);
        setValidationMessage(formatPublishErrors(result.errors));
        return;
      }

      const def = getTemplateDefinition(templateId);
      const occasionKey = (occasion ?? def?.occasion ?? null) as OccasionKey | null;
      const occasionLabel =
        OCCASIONS.find((o) => o.key === occasionKey)?.label ??
        (occasionKey ? OCCASION_CONFIG[occasionKey]?.summaryLabel : undefined) ??
        'Special occasion';

      const relationshipLabel =
        (occasionKey && relationship
          ? OCCASION_CONFIG[occasionKey].relationships.find((r) => r.key === relationship)?.label
          : undefined) ??
        relationship ??
        def?.relationships[0] ??
        'Someone special';

      checkout.openCheckout({
        templateId,
        templateName: def?.label ?? templateId,
        occasion: occasionLabel,
        relationship: String(relationshipLabel),
        experienceId: result.experienceId ?? generatedExperience?.id ?? null,
      });
    } finally {
      setIsValidating(false);
    }
  }, [checkout, generatedExperience?.id, occasion, relationship, router, templateId]);

  return {
    goHome,
    openCheckout,
    isValidating,
    validationErrors,
    validationMessage,
  };
}
