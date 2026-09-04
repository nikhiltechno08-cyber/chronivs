'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { fromBackendExperienceData } from '@/features/experience-engine/adapters/experience-data-adapter';
import { StoryLoadingScreen } from '@/features/experience-engine/components/StoryLoadingScreen';
import { isRegisteredTemplateId } from '@/features/experience-engine/core/template-registry';
import type { ExperienceTemplateId } from '@/features/experience-engine/types';
import type { ExperienceData } from '@/types/experience';

import {
  fetchPublicRuntime,
  PublicRuntimeLoadError,
  type PublicRuntimeErrorKind,
  type PublicRuntimePayload,
} from '../services/publicRuntimeApi';
import { PublicErrorState } from './PublicErrorState';
import { PublicRuntimePlayer } from './PublicRuntimePlayer';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; kind: PublicRuntimeErrorKind; message?: string }
  | {
      status: 'ready';
      templateId: ExperienceTemplateId;
      experienceData: ExperienceData;
      payload: PublicRuntimePayload;
    };

export function PublicRuntimeApp() {
  const params = useParams<{ publicUuid: string }>();
  const token = params?.publicUuid || '';
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    if (!token) {
      setState({ status: 'error', kind: 'invalid' });
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const payload = await fetchPublicRuntime(token);
        if (cancelled) return;

        if (!isRegisteredTemplateId(payload.template_id)) {
          setState({ status: 'error', kind: 'unavailable' });
          return;
        }

        const experienceData = fromBackendExperienceData(payload.experience_data, {
          id: payload.meta.public_uuid,
          templateSlug: payload.template_id,
        });

        // Clear any accidental creator contact that slipped through
        experienceData.creator = {
          name: experienceData.creator?.name || '',
          email: '',
          phone: '',
        };

        setState({
          status: 'ready',
          templateId: payload.template_id as ExperienceTemplateId,
          experienceData,
          payload,
        });
      } catch (err) {
        if (cancelled) return;
        if (err instanceof PublicRuntimeLoadError) {
          setState({ status: 'error', kind: err.kind, message: err.message });
          return;
        }
        setState({ status: 'error', kind: 'unavailable' });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (state.status === 'loading') {
    return (
      <StoryLoadingScreen
        message="Opening your story…"
        startProgress={20}
        maxProgress={90}
      />
    );
  }

  if (state.status === 'error') {
    return <PublicErrorState kind={state.kind} message={state.message} />;
  }

  return (
    <PublicRuntimePlayer
      templateId={state.templateId}
      experienceData={state.experienceData}
      publicUuid={state.payload.meta.public_slug || state.payload.meta.public_uuid}
      musicUrl={state.payload.music_url}
      showCreateCta={state.payload.meta.show_create_cta !== false}
    />
  );
}
