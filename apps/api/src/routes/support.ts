import type { FastifyInstance } from 'fastify';
import { recordAudit } from '../lib/audit.js';
import { isUuid, readText, type RequestBody } from '../lib/request-values.js';
import type { RouteContext } from './context.js';

/** Registers customer support tickets and the support-only audit feed. */
export function registerSupportRoutes(app: FastifyInstance, context: RouteContext): void {
  const { pool } = context;

  app.get('/api/support/tickets', { preHandler: context.requireUser }, async request => {
    const canReadAllTickets = request.authUser!.role === 'support';
    const result = await pool.query(
      `SELECT st.*,u.email,b.reference booking_reference
       FROM support_tickets st
       JOIN users u ON u.id=st.user_id
       LEFT JOIN bookings b ON b.id=st.booking_id
       WHERE $1::boolean OR st.user_id=$2
       ORDER BY st.created_at DESC`,
      [canReadAllTickets, request.authUser!.id]
    );
    return { tickets: result.rows };
  });

  app.post('/api/support/tickets', { preHandler: context.requireUser }, async (request, reply) => {
    const body = request.body as RequestBody;
    const subject = readText(body.subject, 120);
    const message = readText(body.message, 2000);
    const bookingId = body.bookingId || null;
    if (subject.length < 3 || message.length < 5 || (bookingId && !isUuid(bookingId))) {
      return reply.code(400).send({ error: 'Ticket invalide' });
    }

    if (bookingId) {
      const ownedBooking = await pool.query(
        'SELECT 1 FROM bookings WHERE id=$1 AND user_id=$2',
        [bookingId, request.authUser!.id]
      );
      if (!ownedBooking.rowCount) {
        return reply.code(404).send({ error: 'Réservation introuvable' });
      }
    }

    const created = await pool.query(
      `INSERT INTO support_tickets(user_id,booking_id,subject,message)
       VALUES($1,$2,$3,$4)
       RETURNING *`,
      [request.authUser!.id, bookingId, subject, message]
    );
    await recordAudit(
      pool,
      request.authUser,
      'support.ticket_created',
      'support_ticket',
      created.rows[0].id
    );
    return reply.code(201).send({ ticket: created.rows[0] });
  });

  app.patch('/api/support/tickets/:id', { preHandler: context.requireRole('support') }, async (request, reply) => {
    const id = (request.params as RequestBody).id;
    const body = request.body as RequestBody;
    const status = readText(body.status, 20);
    const response = readText(body.response, 2000);
    if (!isUuid(id) || !['open', 'in_progress', 'closed'].includes(status) || response.length < 2) {
      return reply.code(400).send({ error: 'Mise à jour invalide' });
    }

    const result = await pool.query(
      `UPDATE support_tickets
       SET status=$1,support_reply=$2,updated_at=now()
       WHERE id=$3
       RETURNING *`,
      [status, response, id]
    );
    if (!result.rowCount) return reply.code(404).send({ error: 'Ticket introuvable' });

    await recordAudit(pool, request.authUser, 'support.ticket_updated', 'support_ticket', id, { status });
    return { ticket: result.rows[0] };
  });

  app.get('/api/audit', { preHandler: context.requireRole('support') }, async () => {
    const result = await pool.query(
      `SELECT a.id,a.action,a.entity_type,a.entity_id,a.metadata,a.created_at,u.email
       FROM audit_events a
       LEFT JOIN users u ON u.id=a.user_id
       ORDER BY a.created_at DESC
       LIMIT 100`
    );
    return { events: result.rows };
  });
}
