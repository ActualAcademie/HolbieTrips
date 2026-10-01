import { useCallback, useEffect, useState } from 'react';

export type AsyncRunner = <T>(
  operation: () => Promise<T>,
  successMessage?: string
) => Promise<T | undefined>;

/**
 * Owns transient success and error messages and provides a safe wrapper for
 * promise-returning UI actions.
 */
export function useNotifications() {
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const showNotice = useCallback((message: string) => {
    setError('');
    setNotice(message);
  }, []);

  const showError = useCallback((message: string) => {
    setNotice('');
    setError(message);
  }, []);

  const run: AsyncRunner = useCallback(async <T,>(
    operation: () => Promise<T>,
    successMessage = ''
  ): Promise<T | undefined> => {
    setError('');
    setNotice('');
    try {
      const value = await operation();
      if (successMessage) showNotice(successMessage);
      return value;
    } catch (caught) {
      showError(caught instanceof Error ? caught.message : 'Erreur');
      return undefined;
    }
  }, [showError, showNotice]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 4_000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!error) return;
    const timer = window.setTimeout(() => setError(''), 5_000);
    return () => window.clearTimeout(timer);
  }, [error]);

  return {
    notice,
    error,
    showNotice,
    showError,
    clearNotice: () => setNotice(''),
    clearError: () => setError(''),
    run
  };
}
