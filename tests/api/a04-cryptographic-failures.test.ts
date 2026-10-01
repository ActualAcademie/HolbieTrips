import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Pool } from 'pg';
import { buildApp } from '../../apps/api/src/app';
import { protectPassport, revealPassport } from '../../apps/api/src/security';

const key = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const demoPassport = 'FR-DEMO-BRUNO-8742';
const opened: Array<Awaited<ReturnType<typeof buildApp>>> = [];
afterEach(async () => { await Promise.all(opened.splice(0).map(app => app.close())); });

describe('A04 — Passport Panic', () => {
  it('characterizes the flaw: the legacy value is only base64 encoded', async () => {
    const protectedValue = protectPassport(demoPassport, key, 'legacy-base64');
    expect(protectedValue.iv).toBe('legacy-base64');
    expect(Buffer.from(protectedValue.ciphertext, 'base64').toString('utf8')).toBe(demoPassport);

    const account = { id: '10000000-0000-4000-8000-000000000001', email: 'alice.martin@example.test', full_name: 'Alice Martin', role: 'customer' };
    const pool = {
      query: vi.fn(async (sql: string) => sql.includes('FROM sessions') ? { rowCount: 1, rows: [account] } : Promise.reject(new Error(`Unexpected query: ${sql}`))),
      end: vi.fn(async () => undefined)
    };
    const app = await buildApp(pool as unknown as Pool, { serveFrontend: false });
    opened.push(app);
    const response = await app.inject({
      method: 'POST', url: '/api/challenges/a04/claim', headers: { authorization: 'Bearer alice' }, payload: { passportNumber: demoPassport }
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().flag).toMatch(/^FLAG\{a04_[a-f0-9]{24}\}$/);
  });

  it('preserves the authorised read path with authenticated encryption', () => {
    const protectedValue = protectPassport('FR00DEMO123', key, 'aes-gcm');
    expect(protectedValue.ciphertext).not.toContain('FR00DEMO123');
    expect(revealPassport(protectedValue.ciphertext, protectedValue.iv, protectedValue.tag, key)).toBe('FR00DEMO123');
  });
});
