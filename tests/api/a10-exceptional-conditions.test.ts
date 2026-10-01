import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Pool } from 'pg';
import { buildApp } from '../../apps/api/src/app';

const alice = { id: '10000000-0000-4000-8000-000000000001', email: 'alice.martin@example.test', full_name: 'Alice Martin', role: 'customer' };

function fakePool() {
  return { query: vi.fn(async (sql: string) => {
    if (sql.includes('FROM sessions')) return { rowCount: 1, rows: [alice] };
    if (sql.includes('SELECT b.id,b.status')) return { rowCount: 1, rows: [{ id: 'booking', status: 'pending', payment_status: null }] };
    if (sql.includes("UPDATE bookings SET status='confirmed'")) return { rowCount: 1, rows: [] };
    throw new Error(`Unexpected query: ${sql}`);
  }), end: vi.fn(async () => undefined) };
}

const opened: Array<Awaited<ReturnType<typeof buildApp>>> = [];
afterEach(async () => { await Promise.all(opened.splice(0).map(app => app.close())); });

describe('A10 — The Emergency Exit Is Open', () => {
  it('characterizes the flaw: an unavailable mandatory check confirms the booking', async () => {
    const pool = fakePool(); const app = await buildApp(pool as unknown as Pool, { serveFrontend: false }); opened.push(app);
    const response = await app.inject({ method: 'POST', url: '/api/bookings/40000000-0000-4000-8000-000000000001/confirm', headers: { authorization: 'Bearer alice' }, payload: { simulateCheckFailure: true } });
    expect(response.statusCode).toBe(200);
    expect(response.json().flag).toMatch(/^FLAG\{a10_[a-f0-9]{24}\}$/);
  });

  it('preserves the normal rejection when payment is missing', async () => {
    const app = await buildApp(fakePool() as unknown as Pool, { serveFrontend: false }); opened.push(app);
    const response = await app.inject({ method: 'POST', url: '/api/bookings/40000000-0000-4000-8000-000000000001/confirm', headers: { authorization: 'Bearer alice' }, payload: {} });
    expect(response.statusCode).toBe(409);
    expect(response.body).not.toContain('FLAG{');
  });
});
