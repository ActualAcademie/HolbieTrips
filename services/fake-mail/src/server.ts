import Fastify from 'fastify';
import { randomUUID } from 'node:crypto';

type MailRequest = Record<string, unknown>;
type CapturedMessage = MailRequest & { id: string; createdAt: string };

const app = Fastify({ logger: true, bodyLimit: 32_000 });
const messages: CapturedMessage[] = [];

app.get('/health', async () => ({ status: 'ok' }));
app.get('/messages', async () => ({ messages }));

/** Captures a fictional message in a bounded in-memory mailbox. */
app.post('/messages', async (request, reply) => {
  const body = request.body as MailRequest;
  const recipient = String(body.to ?? '');
  const template = String(body.template ?? '');
  if (!recipient.endsWith('.test') || !template) {
    return reply.code(400).send({ error: 'Message fictif invalide' });
  }

  const message = {
    id: randomUUID(),
    ...body,
    createdAt: new Date().toISOString()
  };
  messages.unshift(message);
  if (messages.length > 50) messages.pop();
  return reply.code(201).send({ accepted: true, id: message.id });
});

await app.listen({ host: '0.0.0.0', port: Number(process.env.PORT ?? 8082) });
