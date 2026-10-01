import { createHmac, randomBytes } from 'node:crypto';

export type ChallengeId = 'A01' | 'A02' | 'A03' | 'A04' | 'A05' | 'A06' | 'A07' | 'A08' | 'A09' | 'A10';

export type ChallengeFlagProvider = {
  get(challengeId: ChallengeId): string;
};

/**
 * Keeps only one random secret in process memory. Complete flags are derived
 * when requested by a route and are never persisted by the provider.
 */
export function createChallengeFlagProvider(secret = randomBytes(32)): ChallengeFlagProvider {
  return {
    get(challengeId) {
      const suffix = createHmac('sha256', secret)
        .update(`holbietrips:${challengeId}`)
        .digest('hex')
        .slice(0, 24);
      return `FLAG{${challengeId.toLowerCase()}_${suffix}}`;
    }
  };
}
