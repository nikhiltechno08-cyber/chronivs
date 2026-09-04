'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { memo, useLayoutEffect, useRef } from 'react';

import { useExperiencePersistence } from '@/features/experience-engine/persistence/useExperiencePersistence';
import { useStudioStore } from '@/features/studio/store/studio-store';

import { beginNewStudioSession } from '../store/begin-new-session';
import { SaveStatusIndicator } from './SaveStatusIndicator';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function waitForStudioHydration(): Promise<void> {
  if (useStudioStore.persist.hasHydrated()) return;
  await new Promise<void>((resolve) => {
    const unsub = useStudioStore.persist.onFinishHydration(() => {
      unsub();
      resolve();
    });
  });
}

/**
 * Bootstraps draft persistence:
 * - Create Experience (?new=1) → POST draft → /studio?id={uuid}
 * - /studio?id=… → GET + restore editor
 * - Autosave via useExperiencePersistence
 */
export const StudioPersistenceBoot = memo(function StudioPersistenceBoot() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const handledRef = useRef(false);
  const { saveStatus, createDraft, loadDraft, markBootstrapped } = useExperiencePersistence({
    enabled: true,
  });

  useLayoutEffect(() => {
    // Claim the boot synchronously — awaiting first lets a StrictMode double
    // invoke slip through and create a second orphan draft row.
    if (handledRef.current) return;
    handledRef.current = true;

    const run = async () => {
      await waitForStudioHydration();

      const isNew = searchParams.get('new') === '1';
      const urlId = searchParams.get('id') || searchParams.get('experienceId');

      if (isNew) {
        beginNewStudioSession();
        const draftId = await createDraft();
        if (draftId) {
          useStudioStore.getState().setGeneratedExperience({
            id: draftId,
            status: 'ready',
          });
          router.replace(`/studio?id=${draftId}`);
        } else {
          markBootstrapped();
          router.replace('/studio');
        }
        return;
      }

      if (urlId && UUID_RE.test(urlId)) {
        const ok = await loadDraft(urlId);
        if (!ok) {
          router.replace('/studio?new=1');
        }
        return;
      }

      // Stale client ids (exp_*) or invalid URL ids — start a fresh draft.
      if (urlId && !UUID_RE.test(urlId)) {
        beginNewStudioSession();
        const draftId = await createDraft();
        if (draftId) {
          useStudioStore.getState().setGeneratedExperience({
            id: draftId,
            status: 'ready',
          });
          router.replace(`/studio?id=${draftId}`);
        } else {
          markBootstrapped();
          router.replace('/studio');
        }
        return;
      }

      const localId = useStudioStore.getState().generatedExperience?.id;
      if (localId && UUID_RE.test(localId)) {
        const ok = await loadDraft(localId);
        if (ok) {
          router.replace(`/studio?id=${localId}`);
        } else {
          // Local id stale — create a fresh draft
          beginNewStudioSession();
          const draftId = await createDraft();
          if (draftId) {
            useStudioStore.getState().setGeneratedExperience({
              id: draftId,
              status: 'ready',
            });
            router.replace(`/studio?id=${draftId}`);
          } else {
            markBootstrapped();
          }
        }
        return;
      }

      // Bare /studio — create draft so DB is always source of truth
      const draftId = await createDraft();
      if (draftId) {
        useStudioStore.getState().setGeneratedExperience({
          id: draftId,
          status: 'ready',
        });
        router.replace(`/studio?id=${draftId}`);
      } else {
        markBootstrapped();
      }
    };

    void run();
  }, [createDraft, loadDraft, markBootstrapped, router, searchParams]);

  return <SaveStatusIndicator status={saveStatus} />;
});
