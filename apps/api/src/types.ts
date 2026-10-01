import type { Pool } from 'pg';

export type Role = 'customer' | 'support';
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
}

declare module 'fastify' {
  interface FastifyInstance {
    db: Pool;
  }

  interface FastifyRequest {
    authUser: AuthUser | null;
  }
}
