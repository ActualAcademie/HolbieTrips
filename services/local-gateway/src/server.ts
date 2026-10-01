import { createServer, request, type IncomingHttpHeaders } from 'node:http';

const port = Number(process.env.PORT ?? 8083);
const upstreamHost = process.env.UPSTREAM_HOST ?? 'app';
const upstreamPort = Number(process.env.UPSTREAM_PORT ?? 8080);
const hopByHopHeaders = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade'
]);

/** Removes connection-scoped headers before forwarding an HTTP message. */
function forwardedHeaders(headers: IncomingHttpHeaders): Record<string, string | string[] | undefined> {
  return Object.fromEntries(
    Object.entries(headers).filter(([name]) => !hopByHopHeaders.has(name.toLowerCase()))
  );
}

/** Proxies one loopback request to the application on the private Docker network. */
const server = createServer((incoming, outgoing) => {
  const headers = forwardedHeaders(incoming.headers);
  headers.host = `${upstreamHost}:${upstreamPort}`;

  const upstream = request({
    hostname: upstreamHost,
    port: upstreamPort,
    method: incoming.method,
    path: incoming.url,
    headers,
    timeout: 5_000
  }, response => {
    outgoing.writeHead(response.statusCode ?? 502, forwardedHeaders(response.headers));
    response.pipe(outgoing);
  });

  upstream.on('timeout', () => upstream.destroy(new Error('Upstream timeout')));
  upstream.on('error', () => {
    if (!outgoing.headersSent) {
      outgoing.writeHead(502, { 'content-type': 'application/json' });
    }
    outgoing.end(JSON.stringify({ error: 'Application locale indisponible' }));
  });
  incoming.pipe(upstream);
});

server.listen(port, '0.0.0.0');
