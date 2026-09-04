'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { ADMIN_AUTH_BROADCAST_CHANNEL } from '../constants/session';
import {
  fetchAdminSession,
  getAdminAuthErrorMessage,
  loginAdminSession,
  logoutAdminSession,
  AdminAuthError,
} from './admin-auth-service';
import type { AdminSession, AdminUser } from './types';

type AdminAuthBroadcastMessage =
  | { type: 'login' }
  | { type: 'logout' }
  | { type: 'session-expired' };

type AdminAuthContextValue = {
  user: AdminUser | null;
  session: AdminSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

type AdminSessionProviderProps = {
  children: ReactNode;
};

export function AdminSessionProvider({ children }: AdminSessionProviderProps) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const expiryTimerRef = useRef<number | null>(null);
  const broadcastRef = useRef<BroadcastChannel | null>(null);

  const clearExpiryTimer = useCallback(() => {
    if (expiryTimerRef.current !== null) {
      window.clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }
  }, []);

  const broadcast = useCallback((message: AdminAuthBroadcastMessage) => {
    broadcastRef.current?.postMessage(message);
  }, []);

  const scheduleExpiry = useCallback(
    (nextSession: AdminSession | null) => {
      clearExpiryTimer();
      if (!nextSession?.expiresAt) {
        return;
      }

      const expiresAt = new Date(nextSession.expiresAt).getTime();
      const delay = expiresAt - Date.now();
      if (Number.isNaN(expiresAt) || delay <= 0) {
        setSession(null);
        setError('Your session has expired. Please sign in again.');
        broadcast({ type: 'session-expired' });
        return;
      }

      expiryTimerRef.current = window.setTimeout(() => {
        setSession(null);
        setError('Your session has expired. Please sign in again.');
        void logoutAdminSession().catch(() => undefined);
        broadcast({ type: 'session-expired' });
      }, delay);
    },
    [broadcast, clearExpiryTimer],
  );

  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextSession = await fetchAdminSession();
      setSession(nextSession);
      scheduleExpiry(nextSession);
    } catch (refreshError) {
      setSession(null);
      setError(getAdminAuthErrorMessage(refreshError));
      clearExpiryTimer();
    } finally {
      setIsLoading(false);
    }
  }, [clearExpiryTimer, scheduleExpiry]);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);

      try {
        await loginAdminSession(email, password);
        const verifiedSession = await fetchAdminSession();
        if (!verifiedSession) {
          throw new AdminAuthError(
            'Sign-in succeeded but the session cookie was not saved. Allow cookies for localhost and try again.',
            401,
            'unauthorized',
          );
        }

        setSession(verifiedSession);
        scheduleExpiry(verifiedSession);
        broadcast({ type: 'login' });
      } catch (loginError) {
        setSession(null);
        clearExpiryTimer();
        const message = getAdminAuthErrorMessage(loginError);
        setError(message);
        throw loginError;
      } finally {
        setIsLoading(false);
      }
    },
    [broadcast, clearExpiryTimer, scheduleExpiry],
  );

  const logout = useCallback(async () => {
    clearExpiryTimer();
    try {
      await logoutAdminSession();
    } catch {
      // Always clear local session even if the network request fails.
    } finally {
      setSession(null);
      setError(null);
      broadcast({ type: 'logout' });
    }
  }, [broadcast, clearExpiryTimer]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') {
      return undefined;
    }

    const channel = new BroadcastChannel(ADMIN_AUTH_BROADCAST_CHANNEL);
    broadcastRef.current = channel;

    channel.onmessage = (event: MessageEvent<AdminAuthBroadcastMessage>) => {
      if (event.data.type === 'logout' || event.data.type === 'session-expired') {
        clearExpiryTimer();
        setSession(null);
        if (event.data.type === 'session-expired') {
          setError('Your session has expired. Please sign in again.');
        }
        return;
      }

      if (event.data.type === 'login') {
        void refreshSession();
      }
    };

    return () => {
      channel.close();
      broadcastRef.current = null;
    };
  }, [clearExpiryTimer, refreshSession]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && session) {
        void refreshSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [refreshSession, session]);

  useEffect(() => () => clearExpiryTimer(), [clearExpiryTimer]);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      isAuthenticated: Boolean(session?.user),
      isLoading,
      error,
      login,
      refreshSession,
      logout,
    }),
    [session, isLoading, error, login, refreshSession, logout],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

/** @deprecated Use AdminSessionProvider */
export const AdminAuthProvider = AdminSessionProvider;

export function useAdminAuthContext(): AdminAuthContextValue {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminSessionProvider');
  }
  return context;
}
