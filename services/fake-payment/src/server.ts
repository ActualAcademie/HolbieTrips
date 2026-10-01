import Fastify from 'fastify';
import { createHmac, randomUUID } from 'node:crypto';

type PaymentRequest = Record<string, unknown>;

const app = Fastify({ logger: true, bodyLimit: 32_000 });
const signingKey = process.env.PAYMENT_SIGNING_KEY
  ?? 'local-demo-payment-signing-key-not-a-real-secret';

app.get('/health', async () => ({ status: 'ok' }));

/** Validates a fictional payment and returns a signed local provider response. */
app.post('/payments', async (request, reply) => {
  const body = request.body as PaymentRequest;
  const bookingId = String(body.bookingId ?? '');
  const cardNumber = String(body.cardNumber ?? '').replace(/\D/g, '');
  const amountCents = Number(body.amountCents);
  const validRequest = /^[0-9a-f-]{36}$/i.test(bookingId)
    && Number.isInteger(amountCents)
    && amountCents >= 0
    && /^\d{16}$/.test(cardNumber);

  if (!validRequest) {
    return reply.code(400).send({ error: 'Requête fictive invalide' });
  }

  const payment = {
    bookingId,
    amountCents,
    status: cardNumber.endsWith('0000') ? 'declined' : 'approved',
    providerReference: `FAKE-${randomUUID()}`,
    cardLast4: cardNumber.slice(-4)
  };
  const signature = createHmac('sha256', signingKey)
    .update(JSON.stringify(payment))
    .digest('hex');
  return { ...payment, signature };
});

await app.listen({ host: '0.0.0.0', port: Number(process.env.PORT ?? 8081) });
