import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Pool } from 'pg';
import { buildApp } from '../../apps/api/src/app';

function fakePool(amount = 129900) {
  const client = { query: vi.fn(async () => ({ rowCount: 1, rows: [] })), release: vi.fn() };
  return { pool: { query: vi.fn(async (sql: string, params: unknown[]) => sql.includes('SELECT id,total_cents FROM bookings') && params[1] === amount ? { rowCount: 1, rows: [{ id: params[0], total_cents: amount }] } : { rowCount: 0, rows: [] }), connect: vi.fn(async () => client), end: vi.fn(async () => undefined) }, client };
}

const opened: Array<Awaited<ReturnType<typeof buildApp>>> = [];
afterEach(async () => { await Promise.all(opened.splice(0).map(app => app.close())); });

describe('A08 — Payment Postcard Pretender', () => {
  it('characterizes the flaw: an unsigned callback confirms a booking', async () => {
    const fake = fakePool(); const app = await buildApp(fake.pool as unknown as Pool, { serveFrontend: false }); opened.push(app);
    const response = await app.inject({ method: 'POST', url: '/api/payments/callback', payload: {
      bookingId: '40000000-0000-4000-8000-000000000002', amountCents: 129900, status: 'approved', providerReference: 'FORGED-DEMO', cardLast4: '4242'
    } });
    expect(response.statusCode).toBe(200);
    expect(response.json().flag).toMatch(/^FLAG\{a08_[a-f0-9]{24}\}$/);
  });

  it('does not accept a callback with the wrong amount', async () => {
    const fake = fakePool(); const app = await buildApp(fake.pool as unknown as Pool, { serveFrontend: false }); opened.push(app);
    const response = await app.inject({ method: 'POST', url: '/api/payments/callback', payload: {
      bookingId: '40000000-0000-4000-8000-000000000002', amountCents: 1, status: 'approved', providerReference: 'FORGED-DEMO', cardLast4: '4242'
    } });
    expect(response.statusCode).toBe(404);
  });
});
