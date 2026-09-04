import { getAdminApiBase } from '@/features/admin/constants/api';

import type { AdminSession } from './types';

type AdminSessionApiResponse = {
  user: {
    email: string;
    name?: string | null;
    role?: string;
  };
  expires_at?: string | null;
};

export type AdminAuthErrorCode =
  | 'unauthorized'
  | 'forbidden'
  | 'network'
  | 'server'
  | 'unknown';

export class AdminAuthError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: AdminAuthErrorCode = 'unknown',
  ) {
    super(message);
    this.name = 'AdminAuthError';
  }
}

function mapAuthErrorCode(status: number): AdminAuthErrorCode {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status >= 500) return 'server';
  return 'unknown';
}

export function getAdminAuthErrorMessage(error: unknown): string {
  if (error instanceof AdminAuthError) {
    if (error.code === 'network') {
      return 'Unable to reach the admin server. Check your connection and try again.';
    }
    if (error.code === 'unauthorized') {
      return 'Your session has expired. Please sign in again.';
    }
    if (error.code === 'forbidden') {
      return 'You do not have permission to access the admin portal.';
    }
    return error.message;
  }

  if (error instanceof TypeError) {
    return 'Unable to reach the admin server. Check your connection and try again.';
  }

  return 'Something went wrong. Please try again.';
}

function mapSession(payload: AdminSessionApiResponse): AdminSession {
  return {
    user: payload.user,
    expiresAt: payload.expires_at ?? null,
  };
}

async function adminRequest<T>(endpoint: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${getAdminApiBase()}${endpoint}`, {
      ...init,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new AdminAuthError(
      'Unable to reach the admin server.',
      0,
      'network',
    );
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as {
      message?: string;
      detail?: string;
    };
    const fallback =
      response.status === 404
        ? 'Admin API is unavailable. Restart the backend server and try again.'
        : response.status === 401
          ? 'Invalid email or password.'
          : 'Request failed';
    throw new AdminAuthError(
      payload.message ?? payload.detail ?? fallback,
      response.status,
      mapAuthErrorCode(response.status),
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json()) as AdminSessionApiResponse | T;
  return payload as T;
}

export async function loginAdminSession(email: string, password: string): Promise<AdminSession> {
  const payload = await adminRequest<AdminSessionApiResponse>('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return mapSession(payload);
}

export async function fetchAdminSession(): Promise<AdminSession | null> {
  try {
    const payload = await adminRequest<AdminSessionApiResponse>('/admin/me');
    return mapSession(payload);
  } catch (error) {
    if (
      error instanceof AdminAuthError &&
      (error.status === 401 || error.status === 403 || error.status === 404)
    ) {
      return null;
    }
    throw error;
  }
}

export async function logoutAdminSession(): Promise<void> {
  await adminRequest<void>('/admin/logout', { method: 'POST', body: JSON.stringify({}) });
}
