/**
 * Publish API — freeze paid draft into an immutable public experience.
 */

import { useCheckoutStore } from '@/features/checkout/store/checkout-store';
import { useStudioStore } from '@/features/studio/store/studio-store';
import { api } from '@/services/api-client';

export type PublishResponse = {
  published: boolean;
  public_url: string;
  public_uuid: string;
  public_slug?: string;
  published_at: string;
  status: string;
  version?: number;
  template_id?: string | null;
  experience_id?: string;
};

export type PublicRuntimePayload = {
  public_uuid: string;
  public_slug: string;
  public_url?: string | null;
  template_id: string;
  version: number;
  published_at?: string | null;
  status: string;
  experience_data: Record<string, unknown>;
  media_urls: string[];
};

export async function publishExperience(experienceId: string): Promise<PublishResponse> {
  return api.post<PublishResponse>(
    `/experiences/${encodeURIComponent(experienceId)}/publish`,
    {},
  );
}

/** Load frozen runtime payload for the public viewer. */
export async function getPublishedRuntime(publicToken: string): Promise<PublicRuntimePayload> {
  return api.get<PublicRuntimePayload>(`/e/${encodeURIComponent(publicToken)}`);
}

type PublishSuccessRouter = {
  push: (href: string) => void;
};

export function redirectToPublishSuccess(
  router: PublishSuccessRouter,
  result: PublishResponse,
  experienceUuid: string,
) {
  const qs = new URLSearchParams({
    url: result.public_url,
    uuid: result.public_slug || result.public_uuid,
    at: result.published_at,
    id: result.experience_id || experienceUuid,
  });
  router.push(`/publish/success?${qs.toString()}`);
}

/** Publish (idempotent on backend) and navigate to the success screen. */
export async function completeExperiencePublish(
  experienceUuid: string,
  router: PublishSuccessRouter,
): Promise<void> {
  const result = await publishExperience(experienceUuid);
  redirectToPublishSuccess(router, result, experienceUuid);

  // This draft is now frozen. Drop the ids so the next experience cannot
  // inherit them and republish (returning) this experience's link.
  useCheckoutStore.getState().clearCheckoutSession();
  useStudioStore.getState().setGeneratedExperience(null);
}
