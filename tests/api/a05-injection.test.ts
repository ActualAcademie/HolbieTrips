import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Pool } from 'pg';
import { buildApp } from '../../apps/api/src/app';

function fakePool() {
  return {
    query: vi.fn(async (sql: string) => {
      if (sql.includes('FROM trips')) {
        const injected = sql.includes('OR 1=1');
        return { rowCount: 1, rows: [{
          id: injected ? 'hidden' : 'kyoto', slug: injected ? 'archive-search-party' : 'kyoto-saisons',
          title: injected ? 'Dossier interne' : 'Kyoto au rythme des saisons', destination: injected ? 'Archive' : 'Kyoto, Japon',
          description: injected ? 'Voyage interne réservé aux essais' : 'Temples et jardins', departure_date: '2027-10-03',
          return_date: '2027-10-12', price_cents: 219900, seats_available: 9, image_key: 'kyoto'
        }] };
      }
      throw new Error(`Unexpected query: ${sql}`);
    }),
    end: vi.fn(async () => undefined)
  };
}

const opened: Array<Awaited<ReturnType<typeof buildApp>>> = [];
afterEach(async () => { await Promise.all(opened.splice(0).map(app => app.close())); });

describe('A05 — Search Party Crasher', () => {
  it('characterizes the flaw: a crafted search changes the SQL predicate', async () => {
    const pool = fakePool(); const app = await buildApp(pool as unknown as Pool, { serveFrontend: false, diagnosticsEnabled: false }); opened.push(app);
    const response = await app.inject({ method: 'GET', url: `/api/trips?q=${encodeURIComponent("%' OR 1=1) -- ")}` });
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatch(/FLAG\{a05_[a-f0-9]{24}\}/);
    expect(pool.query.mock.calls[0][0]).toContain('OR 1=1');
  });

  it('preserves an ordinary destination search', async () => {
    const app = await buildApp(fakePool() as unknown as Pool, { serveFrontend: false, diagnosticsEnabled: false }); opened.push(app);
    const response = await app.inject({ method: 'GET', url: '/api/trips?q=Kyoto' });
    expect(response.statusCode).toBe(200);
    expect(response.json().trips[0].title).toContain('Kyoto');
  });
});
