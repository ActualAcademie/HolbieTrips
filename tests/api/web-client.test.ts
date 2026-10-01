import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, api } from '../../apps/web/src/api';

afterEach(() => vi.unstubAllGlobals());

function prepareClient() {
  vi.stubGlobal('localStorage', { getItem: vi.fn(() => 'demo-token') });
  const fetchMock = vi.fn(async () => new Response('{}', {
    status: 200,
    headers: { 'content-type': 'application/json' }
  }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('client HTTP du frontend', () => {
  it('n’envoie pas un type JSON lorsqu’une requête POST ne contient aucun corps', async () => {
    const fetchMock = prepareClient();
    await api('/bookings/demo/cancel', { method: 'POST' });
    const headers = fetchMock.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers.authorization).toBe('Bearer demo-token');
    expect(headers['content-type']).toBeUndefined();
  });

  it('conserve le type JSON lorsqu’un corps est réellement présent', async () => {
    const fetchMock = prepareClient();
    await api('/support/tickets', { method: 'POST', body: JSON.stringify({ subject: 'Test' }) });
    const headers = fetchMock.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers['content-type']).toBe('application/json');
  });

  it('conserve le statut HTTP dans les erreurs du client', async () => {
    vi.stubGlobal('localStorage', { getItem: vi.fn(() => 'expired-token') });
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ error: 'Authentification requise' }), {
      status: 401,
      headers: { 'content-type': 'application/json' }
    })));
    await expect(api('/me')).rejects.toEqual(expect.objectContaining<ApiError>({
      name: 'ApiError',
      message: 'Authentification requise',
      status: 401
    }));
  });
});
