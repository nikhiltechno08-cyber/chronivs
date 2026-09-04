/**
 * Public runtime API client — GET /public/{uuid} only.
 */

import { ApiError, api } from '@/services/api-client';

export type PublicRuntimeMeta = {
  public_uuid: string;
  public_slug: string;
  public_url?: string | null;
  published_at?: string | null;
  version: number;
  status: string;
  show_create_cta: boolean;
};

export type PublicRuntimePayload = {
  template_id: string;
  experience_data: Record<string, unknown>;
  media_urls: string[];
  music_url?: string | null;
  meta: PublicRuntimeMeta;
};

export type PublicRuntimeErrorKind =
  | 'invalid'
  | 'not_found'
  | 'deleted'
  | 'expired'
  | 'unavailable'
  | 'network';

export class PublicRuntimeLoadError extends Error {
  kind: PublicRuntimeErrorKind;

  constructor(kind: PublicRuntimeErrorKind, message: string) {
    super(message);
    this.name = 'PublicRuntimeLoadError';
    this.kind = kind;
  }
}

function mapError(err: unknown): PublicRuntimeLoadError {
  if (err instanceof PublicRuntimeLoadError) return err;
  if (err instanceof ApiError) {
    const code = (err.code || '').toLowerCase();
    if (code.includes('invalid')) {
      return new PublicRuntimeLoadError('invalid', 'This experience link is invalid.');
    }
    if (code.includes('expired')) {
      return new PublicRuntimeLoadError('expired', 'This experience link has expired.');
    }
    if (code.includes('deleted')) {
      return new PublicRuntimeLoadError('deleted', 'This experience is no longer available.');
    }
    if (err.status === 404) {
      return new PublicRuntimeLoadError('not_found', 'This experience could not be found.');
    }
    return new PublicRuntimeLoadError('unavailable', 'This experience is temporarily unavailable.');
  }
  return new PublicRuntimeLoadError('network', 'Unable to load this experience right now.');
}

export async function fetchPublicRuntime(publicUuid: string): Promise<PublicRuntimePayload> {
  try {
    return await api.get<PublicRuntimePayload>(`/public/${encodeURIComponent(publicUuid)}`);
  } catch (err) {
    throw mapError(err);
  }
}

export type PublicAnalyticsEvent =
  | 'experience_opened'
  | 'experience_completed'
  | 'experience_replay'
  | 'scene_completed'
  | 'watch_heartbeat';

export async function trackPublicEvent(
  publicUuid: string,
  payload: {
    event: PublicAnalyticsEvent;
    scene_id?: string;
    watch_ms?: number;
    device_type?: string;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  try {
    await api.post(`/public/${encodeURIComponent(publicUuid)}/events`, payload);
  } catch {
    // Analytics must never break the recipient experience.
  }
}
