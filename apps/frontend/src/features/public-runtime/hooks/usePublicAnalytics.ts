'use client';

import { useCallback, useEffect, useRef } from 'react';

import {
  trackPublicEvent,
  type PublicAnalyticsEvent,
} from '../services/publicRuntimeApi';

function detectDeviceType(): string {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent || '';
  if (/iPad|Tablet/i.test(ua)) return 'tablet';
  if (/Mobi|Android/i.test(ua)) return 'mobile';
  return 'desktop';
}

export function usePublicAnalytics(publicUuid: string | null) {
  const startedAt = useRef<number>(Date.now());
  const device = useRef(detectDeviceType());
  const opened = useRef(false);

  const track = useCallback(
    (
      event: PublicAnalyticsEvent,
      extras?: { scene_id?: string; watch_ms?: number; metadata?: Record<string, unknown> },
    ) => {
      if (!publicUuid) return;
      void trackPublicEvent(publicUuid, {
        event,
        scene_id: extras?.scene_id,
        watch_ms: extras?.watch_ms,
        device_type: device.current,
        metadata: extras?.metadata,
      });
    },
    [publicUuid],
  );

  useEffect(() => {
    if (!publicUuid || opened.current) return;
    opened.current = true;
    startedAt.current = Date.now();
    track('experience_opened');
  }, [publicUuid, track]);

  useEffect(() => {
    if (!publicUuid) return;
    const id = window.setInterval(() => {
      track('watch_heartbeat', { watch_ms: Date.now() - startedAt.current });
    }, 30_000);
    return () => window.clearInterval(id);
  }, [publicUuid, track]);

  const trackCompleted = useCallback(() => {
    track('experience_completed', { watch_ms: Date.now() - startedAt.current });
  }, [track]);

  const trackReplay = useCallback(() => {
    startedAt.current = Date.now();
    track('experience_replay');
  }, [track]);

  return { track, trackCompleted, trackReplay };
}
