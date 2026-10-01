import { describe, expect, it } from 'vitest';
import { applyCoupon, canReadBooking } from '../../apps/api/src/domain';

const alice = { id: 'alice', email: 'alice@example.test', fullName: 'Alice', role: 'customer' as const };
const support = { id: 'support', email: 'support@example.test', fullName: 'Support', role: 'support' as const };

describe('règles métier saines', () => {
  it('autorise uniquement le propriétaire ou le support à lire une réservation', () => {
    expect(canReadBooking(alice, 'alice')).toBe(true);
    expect(canReadBooking(alice, 'bruno')).toBe(false);
    expect(canReadBooking(support, 'bruno')).toBe(true);
  });

  it('applique un coupon valide au total calculé côté serveur', () => {
    expect(applyCoupon(100_000, { discountPercent: 15, minimumCents: 50_000 })).toBe(85_000);
  });

  it('refuse un coupon sous le minimum métier', () => {
    expect(() => applyCoupon(49_999, { discountPercent: 15, minimumCents: 50_000 })).toThrow('Coupon non applicable');
  });
});
