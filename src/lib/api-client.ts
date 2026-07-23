import { useAuthStore } from '@/store/auth-store';
import type { ApiErrorBody, TokenPair } from '@/types/api';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parseError(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as ApiErrorBody | { detail?: unknown };
    if ('error' in body) {
      return new ApiError(response.status, body.error.code, body.error.message);
    }
    return new ApiError(response.status, 'VALIDATION_ERROR', JSON.stringify(body.detail));
  } catch {
    return new ApiError(response.status, 'UNKNOWN_ERROR', response.statusText);
  }
}

async function refreshAccessToken(): Promise<boolean> {
  const { refreshToken, setSession, clearSession, user } = useAuthStore.getState();
  if (!refreshToken) return false;

  const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    clearSession();
    return false;
  }

  const tokens = (await response.json()) as TokenPair;
  setSession(tokens, user ?? undefined);
  return true;
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Set for multipart/form-data uploads (see documentsService.uploadFile) —
   * the caller builds its own FormData and we must NOT set a JSON
   * Content-Type or stringify the body ourselves. */
  form?: FormData;
  skipAuth?: boolean;
}

/** Ported from New Turn/frontend/lib/api-client.ts. Every service function
 * calls this instead of fetch() directly — same retry-on-401,
 * skipAuth-bypasses-the-stored-token behavior as the web app, so a
 * skipAuth call with a manually-passed Authorization header (pending-token
 * auth flows) still forwards it untouched. */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, form, skipAuth, headers, ...rest } = options;

  const doFetch = (): Promise<Response> => {
    const accessToken = useAuthStore.getState().accessToken;
    const requestHeaders: Record<string, string> = {
      ...(form ? {} : { 'Content-Type': 'application/json' }),
      ...(headers as Record<string, string>),
    };
    if (!skipAuth && accessToken) {
      requestHeaders.Authorization = `Bearer ${accessToken}`;
    }
    return fetch(`${API_URL}${path}`, {
      ...rest,
      headers: requestHeaders,
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
    });
  };

  let response = await doFetch();

  if (response.status === 401 && !skipAuth) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      response = await doFetch();
    }
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
