import { describe, expect, it } from 'vitest';
import { legacyResetToken, newToken } from '../../apps/api/src/security';

describe('A07 — Reset Route Roulette', () => {
  it('characterizes the flaw: a reset token is predictable from the e-mail address', () => {
    const first = legacyResetToken('bruno.dupont@example.test');
    const second = legacyResetToken('bruno.dupont@example.test');
    expect(first).toBe(second);
    expect(Buffer.from(first, 'base64url').toString('utf8')).toBe('bruno.dupont@example.test');
  });

  it('documents the expected positive property of a secure token', () => {
    expect(newToken()).not.toBe(newToken());
  });
});
