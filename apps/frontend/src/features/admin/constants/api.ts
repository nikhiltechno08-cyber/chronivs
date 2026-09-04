import { env } from '@/lib/env';

/**
 * Admin auth uses same-origin `/api/v1` (rewritten to backend) so HttpOnly
 * session cookies are set on the app host and visible to Next.js middleware.
 */
export function getAdminApiBase(): string {
  if (typeof window !== 'undefined') {
    return '/api/v1';
  }

  return (
    process.env.ADMIN_API_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    env.NEXT_PUBLIC_API_URL
  );
}
