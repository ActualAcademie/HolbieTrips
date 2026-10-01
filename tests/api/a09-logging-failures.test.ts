import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Pool } from 'pg';
import { buildApp } from '../../apps/api/src/app';

const alice = { id: '10000000-0000-4000-8000-000000000001', email: 'alice.martin@example.test', full_name: 'Alice Martin', role: 'customer' };

function fakePool() {
  return { query: vi.fn(async (sql: string) => {
    if (sql.includes('FROM sessions')) return { rowCount: 1, rows: [alice] };
    if (sql.includes("UPDATE bookings SET status='cancelled'")) return { rowCount: 1, rows: [{ id: 'booking', reference: 'HT-ALICE-001', status: 'cancelled' }] };
    throw new Error(`Unexpected query: ${sql}`);
  }), end: vi.fn(async () => undefined) };
}

const opened: Array<Awaited<ReturnType<typeof buildApp>>> = [];
afterEach(async () => { await Promise.all(opened.splice(0).map(app => app.close())); });

describe('A09 — The Silent Suitcase', () => {
  it('characterizes the flaw: cancellation succeeds without an audit insert', async () => {
    const pool = fakePool(); const app = await buildApp(pool as unknown as Pool, { serveFrontend: false }); opened.push(app);
    const response = await app.inject({ method: 'POST', url: '/api/bookings/40000000-0000-4000-8000-000000000001/cancel', headers: { authorization: 'Bearer alice' } });
    expect(response.statusCode).toBe(200);
    expect(response.json().flag).toMatch(/^FLAG\{a09_[a-f0-9]{24}\}$/);
    expect(pool.query.mock.calls.some(([sql]) => String(sql).includes('INSERT INTO audit_events'))).toBe(false);
  });

  it('preserves the customer journey: an owned booking is cancelled', async () => {
    const app = await buildApp(fakePool() as unknown as Pool, { serveFrontend: false }); opened.push(app);
    const response = await app.inject({ method: 'POST', url: '/api/bookings/40000000-0000-4000-8000-000000000001/cancel', headers: { authorization: 'Bearer alice' } });
    expect(response.statusCode).toBe(200);
    expect(response.json().booking).toMatchObject({ reference: 'HT-ALICE-001', status: 'cancelled' });
  });
});
