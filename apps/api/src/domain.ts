import type { AuthUser } from './types.js';

export type CouponRule = { discountPercent: number; minimumCents: number };

/** Evaluates whether an account may read a booking owned by another identifier. */
export function canReadBooking(user: AuthUser, ownerId: string) {
  return user.role === 'support' || user.id === ownerId;
}

/** Applies one validated percentage discount and keeps all arithmetic in cents. */
export function applyCoupon(totalCents: number, coupon: CouponRule) {
  if (!Number.isInteger(totalCents) || totalCents < coupon.minimumCents) throw new Error('Coupon non applicable');
  if (!Number.isInteger(coupon.discountPercent) || coupon.discountPercent < 1 || coupon.discountPercent > 80) throw new Error('Coupon invalide');
  return Math.round(totalCents * (100 - coupon.discountPercent) / 100);
}
