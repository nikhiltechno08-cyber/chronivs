import { env } from '@/lib/env';

export type ApiClientOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  token?: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiClient<T>(endpoint: string, options: ApiClientOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, token } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as {
      error?: string;
      message?: string;
      detail?: string | Array<{ msg?: string }>;
      code?: string;
    };
    const detailMessage = Array.isArray(error.detail)
      ? error.detail.map((d) => d.msg).filter(Boolean).join(', ')
      : typeof error.detail === 'string'
        ? error.detail
        : undefined;
    throw new ApiError(
      error.message ?? error.error ?? detailMessage ?? 'Request failed',
      response.status,
      error.code,
    );
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(endpoint: string, token?: string) =>
    apiClient<T>(endpoint, { method: 'GET', token }),
  post: <T>(endpoint: string, body: unknown, token?: string) =>
    apiClient<T>(endpoint, { method: 'POST', body, token }),
  put: <T>(endpoint: string, body: unknown, token?: string) =>
    apiClient<T>(endpoint, { method: 'PUT', body, token }),
  patch: <T>(endpoint: string, body: unknown, token?: string) =>
    apiClient<T>(endpoint, { method: 'PATCH', body, token }),
  delete: <T>(endpoint: string, token?: string) =>
    apiClient<T>(endpoint, { method: 'DELETE', token }),
};
