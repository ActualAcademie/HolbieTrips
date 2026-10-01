import { describe, expect, it } from 'vitest';
import { createChallengeFlagProvider } from '../../apps/api/src/challenge-flags';

describe('runtime challenge flags', () => {
  it('derives a stable flag inside one process without embedding its final value', () => {
    const flags = createChallengeFlagProvider(Buffer.alloc(32, 1));
    expect(flags.get('A01')).toBe(flags.get('A01'));
    expect(flags.get('A01')).toMatch(/^FLAG\{a01_[a-f0-9]{24}\}$/);
    expect(flags.get('A02')).toMatch(/^FLAG\{a02_[a-f0-9]{24}\}$/);
  });

  it('changes flags when the in-memory process secret changes', () => {
    const first = createChallengeFlagProvider(Buffer.alloc(32, 1));
    const second = createChallengeFlagProvider(Buffer.alloc(32, 2));
    expect(first.get('A01')).not.toBe(second.get('A01'));
  });
});
