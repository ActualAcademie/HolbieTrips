export type { User } from './types';

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Sends a request to the same-origin API and adds the current bearer session.
 * JSON content headers are only added when a body is actually present.
 */
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('holbie-token');
  const hasBody = options.body !== undefined && options.body !== null;
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      ...(hasBody ? { 'content-type': 'application/json' } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(data.error ?? 'Une erreur est survenue', response.status);
  return data;
}
