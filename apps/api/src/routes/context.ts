import type { preHandlerHookHandler } from 'fastify';
import type { Pool } from 'pg';
import type { ChallengeFlagProvider } from '../challenge-flags.js';
import type { config } from '../config.js';
import type { Role } from '../types.js';

/** Dependencies shared by route modules without relying on global state. */
export type RouteContext = {
  pool: Pool;
  settings: typeof config;
  flags: ChallengeFlagProvider;
  requireUser: preHandlerHookHandler;
  requireRole: (role: Role) => preHandlerHookHandler;
};
