import { AxiosError, create, isAxiosError, type InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from '@/utils/tokenStorage';
import type { AuthTokens } from './types';
import { mockAdapter } from '@/mocks/adapter';

const API_URL = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '') || undefined;

/** Mocks are used when no API URL is configured, or when explicitly requested. */
export const USE_MOCKS = !API_URL || import.meta.env.VITE_USE_MOCKS === 'true';

export const api = create({
  baseURL: API_URL ?? 'https://mock.riven.local',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  ...(USE_MOCKS ? { adapter: mockAdapter } : {}),
});

let onSessionExpired: (() => void) | null = null;
export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

api.interceptors.request.use((config) => {
  const tokens = tokenStorage.get();
  if (tokens?.accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

// Single in-flight refresh shared by every request that gets a 401 at the same time.
let refreshPromise: Promise<AuthTokens> | null = null;

async function refreshTokens(): Promise<AuthTokens> {
  const current = tokenStorage.get();
  if (!current?.refreshToken) throw new Error('No refresh token');
  const { data } = await api.post<AuthTokens>('/auth/refresh', { refreshToken: current.refreshToken });
  tokenStorage.save({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    const isAuthCall = original?.url?.startsWith('/auth/');
    if (error.response?.status !== 401 || !original || original._retried || isAuthCall) {
      return Promise.reject(error);
    }
    original._retried = true;
    try {
      refreshPromise ??= refreshTokens().finally(() => {
        refreshPromise = null;
      });
      const tokens = await refreshPromise;
      original.headers.Authorization = `Bearer ${tokens.accessToken}`;
      return api(original);
    } catch (refreshError) {
      tokenStorage.clear();
      onSessionExpired?.();
      return Promise.reject(refreshError);
    }
  },
);

/** Human readable message from any API error. */
export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] } | undefined;
    if (Array.isArray(data?.message)) return data.message.join('\n');
    if (data?.message) return data.message;
    if (error.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
    if (!error.response) return 'Could not reach the server. Check your connection.';
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong.';
}
