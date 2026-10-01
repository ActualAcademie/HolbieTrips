import { describe, expect, it } from 'vitest';
import { decryptSensitive, encryptSensitive, paymentSignature, tokenDigest, validSignature } from '../../apps/api/src/security';

const key = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

describe('socle de sécurité', () => {
  it('chiffre et authentifie les données voyageur sensibles', () => {
    const first = encryptSensitive('FR00DEMO123', key);
    const second = encryptSensitive('FR00DEMO123', key);
    expect(first.ciphertext).not.toBe('FR00DEMO123');
    expect(first.ciphertext).not.toBe(second.ciphertext);
    expect(decryptSensitive(first.ciphertext, first.iv, first.tag, key)).toBe('FR00DEMO123');
  });

  it('détecte une confirmation de paiement falsifiée', () => {
    const payload = { bookingId: 'demo', amountCents: 64900, status: 'approved' };
    const signature = paymentSignature(payload, 'demo-key');
    expect(validSignature(payload, signature, 'demo-key')).toBe(true);
    expect(validSignature({ ...payload, amountCents: 1 }, signature, 'demo-key')).toBe(false);
  });

  it('ne conserve pas les jetons de session en clair', () => {
    expect(tokenDigest('session-fictive')).toMatch(/^[a-f0-9]{64}$/);
    expect(tokenDigest('session-fictive')).not.toContain('session-fictive');
  });
});
