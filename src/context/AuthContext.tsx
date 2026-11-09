import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { setSessionExpiredHandler } from '@/api/client';
import { authApi, usersApi } from '@/api/endpoints';
import { queryKeys } from '@/api/hooks';
import type { AuthResponse } from '@/api/types';
import { tokenStorage } from '@/utils/tokenStorage';

type AuthStatus = 'loading' | 'signedIn' | 'signedOut';

interface AuthContextValue {
  status: AuthStatus;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>('loading');

  const logout = useCallback(async () => {
    await tokenStorage.clear();
    queryClient.clear();
    setStatus('signedOut');
  }, [queryClient]);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      queryClient.clear();
      setStatus('signedOut');
    });

    (async () => {
      const tokens = await tokenStorage.load();
      if (!tokens) return setStatus('signedOut');
      try {
        // Validates the session (the client refreshes an expired access token transparently).
        const user = await usersApi.me();
        queryClient.setQueryData(queryKeys.me, user);
        setStatus('signedIn');
      } catch {
        await tokenStorage.clear();
        setStatus('signedOut');
      }
    })();
  }, [queryClient]);

  const startSession = useCallback(
    async ({ user, accessToken, refreshToken }: AuthResponse) => {
      await tokenStorage.save({ accessToken, refreshToken });
      queryClient.setQueryData(queryKeys.me, user);
      setStatus('signedIn');
    },
    [queryClient],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      login: async (email, password) => startSession(await authApi.login({ email, password })),
      register: async (fullName, email, password) => startSession(await authApi.register({ fullName, email, password })),
      deleteAccount: async (password) => {
        await usersApi.remove(password);
        await logout();
      },
      logout,
    }),
    [status, startSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
