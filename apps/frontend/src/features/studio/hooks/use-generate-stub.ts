'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { resolveTemplateId } from '@/features/experience-engine/core/template-registry';

import { LOADING_MESSAGES, OCCASION_CONFIG } from '../constants/occasions';
import { useStudioStore } from '../store/studio-store';
import type { OccasionKey } from '../types';
import { saveSessionMedia } from '../utils/session-media';

/** Keep this short — users should feel motion, not a stall. */
const LOADING_DURATION_MS = 3200;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Prefer the DB draft UUID — never invent client `exp_*` ids for persistence. */
function resolveDurableExperienceId(): string {
  const fromStore = useStudioStore.getState().generatedExperience?.id;
  if (fromStore && UUID_RE.test(fromStore)) return fromStore;
  if (typeof window !== 'undefined') {
    const fromUrl = new URLSearchParams(window.location.search).get('id');
    if (fromUrl && UUID_RE.test(fromUrl)) return fromUrl;
  }
  return '';
}

/**
 * Module-level timers so Suspense / Strict Mode remounts cannot cancel
 * an in-flight generate and leave phase stuck on "loading".
 */
let activeGenerationId = 0;
let activeCompleteTimer: ReturnType<typeof setTimeout> | null = null;
let activeProgressTimer: ReturnType<typeof setInterval> | null = null;
let activeMessageTimer: ReturnType<typeof setInterval> | null = null;

function clearGenerationTimers() {
  if (activeCompleteTimer) {
    clearTimeout(activeCompleteTimer);
    activeCompleteTimer = null;
  }
  if (activeProgressTimer) {
    clearInterval(activeProgressTimer);
    activeProgressTimer = null;
  }
  if (activeMessageTimer) {
    clearInterval(activeMessageTimer);
    activeMessageTimer = null;
  }
}

let latestRouter: { push: (href: string) => void } | null = null;

function openTemplatePreview(templateId: string) {
  const href = `/experience/${templateId}`;
  latestRouter?.push(href);

  window.setTimeout(() => {
    if (typeof window === 'undefined') return;
    if (window.location.pathname.startsWith('/experience/')) return;
    window.location.assign(href);
  }, 800);
}

function completeGeneration() {
  const state = useStudioStore.getState();
  const occasion = state.occasion;
  const relationship = state.relationship;
  const receiverName = state.receiverName;
  const cfg = occasion ? OCCASION_CONFIG[occasion as OccasionKey] : null;
  const templateId = resolveTemplateId(occasion, relationship) ?? 'birthday-girlfriend';

  state.setTemplateConfig({ templateId, resolvedAt: new Date().toISOString() });
  state.setGeneratedExperience({
    id: resolveDurableExperienceId(),
    status: 'ready',
    templateId,
    previewTitle: receiverName ? `For ${receiverName}` : 'For someone special',
    previewEmoji: cfg?.emoji,
  });

  try {
    saveSessionMedia(state.photos, state.audio);
  } catch {
    // Preview still works with fallbacks
  }

  // Stay on phase=loading until the experience template mounts (see ExperiencePlayer).
  openTemplatePreview(templateId);
}

export function useGenerateStub() {
  const router = useRouter();
  const setPhase = useStudioStore((s) => s.setPhase);
  const phase = useStudioStore((s) => s.phase);

  const [loadingMessage, setLoadingMessage] = useState<string>(LOADING_MESSAGES[0]!);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const msgIndexRef = useRef(0);

  latestRouter = router;

  const runGenerate = useCallback(() => {
    clearGenerationTimers();
    const generationId = ++activeGenerationId;

    try {
      sessionStorage.setItem('chronivs-preview-loading', '1');
    } catch {
      /* ignore */
    }

    setPhase('loading');
    setLoadingProgress(0);
    msgIndexRef.current = 0;
    setLoadingMessage(LOADING_MESSAGES[0]!);

    const state = useStudioStore.getState();
    const templateId =
      resolveTemplateId(state.occasion, state.relationship) ?? 'birthday-girlfriend';
    try {
      router.prefetch(`/experience/${templateId}`);
    } catch {
      /* ignore */
    }

    const startedAt = Date.now();

    activeMessageTimer = setInterval(() => {
      if (generationId !== activeGenerationId) return;
      msgIndexRef.current = (msgIndexRef.current + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[msgIndexRef.current]!);
    }, 900);

    activeProgressTimer = setInterval(() => {
      if (generationId !== activeGenerationId) return;
      const p = Math.min((Date.now() - startedAt) / LOADING_DURATION_MS, 1);
      setLoadingProgress(p * 100);
    }, 50);

    // Navigate slightly before the bar finishes so /experience/loading.tsx
    // can take over without a blank/spinner gap.
    activeCompleteTimer = setTimeout(() => {
      if (generationId !== activeGenerationId) return;
      setLoadingProgress(100);
      completeGeneration();
      // Timers keep the studio overlay alive until the route unmounts it.
      window.setTimeout(() => clearGenerationTimers(), 400);
    }, LOADING_DURATION_MS);
  }, [router, setPhase]);

  // Unstick if we remounted into phase=loading with no live timers
  useEffect(() => {
    if (phase !== 'loading') return;
    if (activeCompleteTimer || activeProgressTimer) return;

    const recoveryTimer = setTimeout(() => {
      if (useStudioStore.getState().phase !== 'loading') return;
      // A fresh generate may have started since this recovery was scheduled
      if (activeCompleteTimer || activeProgressTimer) return;
      clearGenerationTimers();

      let stillGenerating = false;
      try {
        stillGenerating = sessionStorage.getItem('chronivs-preview-loading') === '1';
      } catch {
        /* ignore */
      }

      if (stillGenerating) {
        completeGeneration();
      } else {
        useStudioStore.getState().setPhase('flow');
        try {
          sessionStorage.removeItem('chronivs-preview-loading');
        } catch {
          /* ignore */
        }
      }
    }, 300);

    return () => clearTimeout(recoveryTimer);
  }, [phase]);

  return { runGenerate, loadingMessage, loadingProgress };
}
