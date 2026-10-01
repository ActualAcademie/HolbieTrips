import { useCallback, useEffect, useState } from 'react';
import { ApiError, api } from '../api';
import type { User } from '../types';

const TOKEN_KEY = 'holbie-token';
const USER_KEY = 'holbie-user';

/**
 * Restores the browser session against the API before exposing an authenticated
 * user. Local storage is treated as a cache, never as the authority.
 */
export function useSession(onError: (message: string) => void) {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)));

  const establish = useCallback((token: string, authenticatedUser: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(authenticatedUser));
    setUser(authenticatedUser);
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    let active = true;

    const restore = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        localStorage.removeItem(USER_KEY);
        if (active) setChecking(false);
        return;
      }

      try {
        const session = await api<{ user: User }>('/me');
        if (!active) return;
        localStorage.setItem(USER_KEY, JSON.stringify(session.user));
        setUser(session.user);
      } catch (caught) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        if (!active) return;
        setUser(null);
        onError(
          caught instanceof ApiError && caught.status === 401
            ? 'Votre session a expiré. Veuillez vous reconnecter.'
            : caught instanceof Error
              ? caught.message
              : 'Impossible de restaurer la session.'
        );
      } finally {
        if (active) setChecking(false);
      }
    };

    void restore();
    return () => {
      active = false;
    };
  }, [onError]);

  return { user, checking, establish, clear };
}
