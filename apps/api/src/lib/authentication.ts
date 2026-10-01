import type { FastifyInstance, preHandlerHookHandler } from 'fastify';
import type { Pool } from 'pg';
import { tokenDigest } from '../security.js';
import type { Role } from '../types.js';

/**
 * Resolves bearer sessions once for every request and exposes the authenticated
 * account through Fastify's typed request decoration.
 */
export function registerSessionAuthentication(app: FastifyInstance, pool: Pool): void {
  app.decorateRequest('authUser', null);
  app.addHook('onRequest', async request => {
    const authorization = request.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) return;

    const result = await pool.query(
      `SELECT u.id, u.email, u.full_name, u.role
       FROM sessions s
       JOIN users u ON u.id=s.user_id
       WHERE s.token_hash=$1 AND s.expires_at > now()`,
      [tokenDigest(authorization.slice(7))]
    );

    if (!result.rowCount) return;
    const account = result.rows[0];
    request.authUser = {
      id: account.id,
      email: account.email,
      fullName: account.full_name,
      role: account.role
    };
  });
}

/** Rejects routes that require an authenticated local account. */
export const requireUser: preHandlerHookHandler = async (request, reply) => {
  if (!request.authUser) {
    return reply.code(401).send({ error: 'Authentification requise' });
  }
};

/** Builds a reusable role guard for staff-only route groups. */
export function requireRole(role: Role): preHandlerHookHandler {
  return async (request, reply) => {
    if (!request.authUser) {
      return reply.code(401).send({ error: 'Authentification requise' });
    }
    if (request.authUser.role !== role) {
      return reply.code(403).send({ error: 'Accès refusé' });
    }
  };
}
