'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  applyExperienceDataToStudio,
  fromBackendExperienceData,
} from '@/features/experience-engine/adapters/experience-data-adapter';
import { useExperience } from '@/features/experience-engine/context/ExperienceContext';
import { createExperience as createEmptyExperience } from '@/lib/createExperience';
import { ApiError } from '@/services/api-client';
import {
  createExperience,
  getExperience,
  updateExperience,
} from '@/services/experience.service';
import type { ExperienceData } from '@/types/experience';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline';

const AUTOSAVE_MS = 2000;
const RETRY_MS = 4000;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const FROZEN_STATUSES = new Set(['published', 'archived']);

function isDurableExperienceId(id: string): boolean {
  return UUID_RE.test(id);
}

function isRetryablePersistError(error: unknown): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return true;
  if (error instanceof ApiError) {
    // Validation / bad id / not found — retrying forever only floods the console.
    if (error.status === 408 || error.status === 429) return true;
    if (error.status >= 500) return true;
    return false;
  }
  return true;
}

function stableSerialize(data: ExperienceData): string {
  // Ignore volatile updatedAt noise for equality checks
  const clone = {
    ...data,
    metadata: {
      ...data.metadata,
      updatedAt: '',
    },
  };
  return JSON.stringify(clone);
}

export function useExperiencePersistence(options: { enabled?: boolean } = {}) {
  const enabled = options.enabled !== false;
  const { experienceData, setExperienceData } = useExperience();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [experienceId, setExperienceId] = useState<string>(
    isDurableExperienceId(experienceData.experienceId) ? experienceData.experienceId : '',
  );

  const lastSavedRef = useRef<string>('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inflightRef = useRef(false);
  const pendingRef = useRef<ExperienceData | null>(null);
  const bootstrappedRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (retryRef.current) clearTimeout(retryRef.current);
    debounceRef.current = null;
    retryRef.current = null;
  }, []);

  const persistNow = useCallback(async (data: ExperienceData, id: string) => {
    if (!isDurableExperienceId(id)) return;
    if (inflightRef.current) {
      pendingRef.current = data;
      return;
    }

    const serialized = stableSerialize({ ...data, experienceId: id });
    if (serialized === lastSavedRef.current) {
      setSaveStatus((prev) => (prev === 'error' || prev === 'offline' ? prev : 'saved'));
      return;
    }

    inflightRef.current = true;
    setSaveStatus('saving');
    let succeeded = false;
    try {
      await updateExperience(id, { ...data, experienceId: id });
      lastSavedRef.current = serialized;
      succeeded = true;
      setSaveStatus('saved');
      pendingRef.current = null;
    } catch (error) {
      setSaveStatus(typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'error');
      if (isRetryablePersistError(error)) {
        pendingRef.current = data;
        if (retryRef.current) clearTimeout(retryRef.current);
        retryRef.current = setTimeout(() => {
          void persistNow(pendingRef.current ?? data, id);
        }, RETRY_MS);
      } else {
        // Permanent client/server validation failure — stop the loop.
        pendingRef.current = null;
        if (retryRef.current) {
          clearTimeout(retryRef.current);
          retryRef.current = null;
        }
      }
    } finally {
      inflightRef.current = false;
      // Drain coalesced edits only after a successful save (avoids tight failure loops).
      if (succeeded && pendingRef.current) {
        const next = pendingRef.current;
        pendingRef.current = null;
        if (stableSerialize(next) !== lastSavedRef.current) {
          void persistNow(next, id);
        }
      }
    }
  }, []);

  const createDraft = useCallback(async (): Promise<string | null> => {
    setSaveStatus('saving');
    try {
      const empty = createEmptyExperience();
      const created = await createExperience(empty);
      const id = created.id;
      if (!isDurableExperienceId(id)) {
        setSaveStatus('error');
        return null;
      }
      const seeded = {
        ...fromBackendExperienceData(created.experience_data, {
          id,
          occasion: created.occasion,
          relationship: created.relationship,
          templateSlug: created.template_slug,
        }),
        experienceId: id,
      };
      setExperienceId(id);
      setExperienceData(seeded);
      lastSavedRef.current = stableSerialize(seeded);
      setSaveStatus('saved');
      bootstrappedRef.current = true;
      return id;
    } catch {
      setSaveStatus('error');
      return null;
    }
  }, [setExperienceData]);

  const loadDraft = useCallback(
    async (id: string): Promise<boolean> => {
      if (!isDurableExperienceId(id)) {
        setSaveStatus('error');
        return false;
      }
      setSaveStatus('saving');
      try {
        const remote = await getExperience(id);
        // Published experiences are frozen — editing one would republish it and
        // hand back its existing public link instead of a new experience.
        if (FROZEN_STATUSES.has(String(remote.status).toLowerCase())) {
          setSaveStatus('idle');
          return false;
        }
        const restored = {
          ...fromBackendExperienceData(remote.experience_data, {
            id: remote.id,
            occasion: remote.occasion,
            relationship: remote.relationship,
            templateSlug: remote.template_slug,
          }),
          experienceId: remote.id,
        };
        setExperienceId(remote.id);
        setExperienceData(restored);
        applyExperienceDataToStudio(restored);
        lastSavedRef.current = stableSerialize(restored);
        setSaveStatus('saved');
        bootstrappedRef.current = true;
        return true;
      } catch {
        setSaveStatus('error');
        return false;
      }
    },
    [setExperienceData],
  );

  useEffect(() => {
    if (!enabled || !bootstrappedRef.current) return;
    const rawId = experienceId || experienceData.experienceId;
    if (!isDurableExperienceId(rawId)) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void persistNow(experienceData, rawId);
    }, AUTOSAVE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [enabled, experienceData, experienceId, persistNow]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return {
    saveStatus,
    experienceId:
      (isDurableExperienceId(experienceId) && experienceId) ||
      (isDurableExperienceId(experienceData.experienceId) && experienceData.experienceId) ||
      null,
    createDraft,
    loadDraft,
    persistNow,
    markBootstrapped: (id?: string, snapshot?: ExperienceData) => {
      bootstrappedRef.current = true;
      if (id && isDurableExperienceId(id)) setExperienceId(id);
      if (snapshot) lastSavedRef.current = stableSerialize(snapshot);
    },
  };
}
