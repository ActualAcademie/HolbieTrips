import { buildApp } from './app.js';
import { config } from './config.js';

const app = await buildApp();

// Bind inside the container; Compose controls which interface reaches the host.
try {
  await app.listen({ host: '0.0.0.0', port: config.port });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
