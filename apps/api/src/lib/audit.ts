import type { Pool, PoolClient } from 'pg';
import type { AuthUser } from '../types.js';
import type { RequestBody } from './request-values.js';

/**
 * Writes one normalized audit event. Accepting either a pool or a transaction
 * client lets callers keep the audit record atomic with the business change.
 */
export async function recordAudit(
  client: Pool | PoolClient,
  user: AuthUser | null,
  action: string,
  entityType: string,
  entityId?: string,
  metadata: RequestBody = {}
): Promise<void> {
  await client.query(
    'INSERT INTO audit_events(user_id,action,entity_type,entity_id,metadata) VALUES($1,$2,$3,$4,$5)',
    [user?.id ?? null, action, entityType, entityId ?? null, JSON.stringify(metadata)]
  );
}
