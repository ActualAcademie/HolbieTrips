# HolbieTrips

> [!WARNING]
> HolbieTrips is a deliberately vulnerable application-security training lab. Run it only on your own machine. Never expose it to the Internet or a shared network, and never enter real names, credentials, passport details, payment data, or other personal information.

HolbieTrips is a fictional travel-booking platform designed for hands-on OWASP Top 10:2025 practice. Developers can explore realistic business flows, investigate a challenge in a controlled environment, implement a remediation, and verify that both security and legitimate behaviour still work.

The entire platform runs locally. It sends no real e-mail, performs no real payment, uses no production secret, and requires no external runtime service.

## Technology stack

- React, Vite, and TypeScript for the browser application
- Node.js 24, Fastify, and TypeScript for the API
- PostgreSQL 17 with `pg`, SQL migrations, and SQL seeds
- Small Fastify simulators for payment and e-mail
- Vitest 5 for API and domain tests
- Docker Compose for the final local environment

## Product features

- travel catalogue and destination search
- customer registration, login, logout, and role-based navigation
- traveller profile management
- booking creation, details, cancellation, and availability tracking
- promotional coupons
- simulated payment processing
- simplified support tickets
- support audit history
- local password-reset request flow

## Quick start

### Requirements

- Docker Desktop or Docker Engine
- Docker Compose v2
- an available local port `8080`

No local Node.js or PostgreSQL installation is required for the standard Docker workflow.

### Start the platform

From the repository root:

```bash
docker compose up --build
```

Wait until `db`, `fake-payment`, `fake-mail`, and `app` are healthy and `local-gateway` has started, then open:

<http://127.0.0.1:8080>

Only this loopback address is published to the host.

### Stop the platform

Stop containers while preserving PostgreSQL data:

```bash
docker compose down
```

### Reset all local data

Remove the PostgreSQL volume, recreate the schema, and reload the demonstration data:

```bash
docker compose down -v
docker compose up --build
```

`docker compose down -v` permanently removes the local lab database volume.

## Demonstration accounts

All accounts and credentials below are fictional and intended only for this repository.

| Role | E-mail | Password |
|---|---|---|
| Customer | `alice.martin@example.test` | `Voyage!Alice2025` |
| Customer | `bruno.dupont@example.test` | `Voyage!Bruno2025` |
| Support | `support@holbietrips.test` | `Support!Holbie2025` |

Additional demonstration values:

- accepted test card: `4242 4242 4242 4242`
- declined-card convention: any fictional 16-digit card ending in `0000`
- coupons: `BIENVENUE10` and `FJORD15`

No payment is transmitted or processed outside the local Docker network.

## Architecture

```text
Browser
  │
  │ http://127.0.0.1:8080
  ▼
local-gateway
  │
  ▼
app ───────────────► PostgreSQL
  │
  ├────────────────► fake-payment
  │
  └────────────────► fake-mail
```

The production-style Vite build is served by the Fastify API. A small gateway is the only service attached to a host port. Application services communicate by Docker DNS on the private `lab` network.

### Compose services

| Service | Responsibility | Host exposure | Storage |
|---|---|---|---|
| `local-gateway` | Accepts loopback traffic and proxies it to the application | `127.0.0.1:8080` | none |
| `app` | Serves the React build and the Fastify API | none | none |
| `db` | Stores users, trips, bookings, payments, tickets, and audit events | none | named volume `postgres-data` |
| `fake-payment` | Produces deterministic local payment outcomes | none | memory only |
| `fake-mail` | Captures up to 50 simulated messages | none | memory only |

The Compose configuration does not use host networking or mount the Docker socket. PostgreSQL and internal HTTP services are not published to the host. Runtime service traffic is constrained to the declared Docker networks.

## Request flow

1. The browser requests the application from `127.0.0.1:8080`.
2. `local-gateway` forwards the request to the `app` service.
3. Fastify handles `/api/*` routes or serves the compiled React application.
4. Authenticated API requests resolve their bearer session from PostgreSQL.
5. Business route modules perform database work and call a simulator when needed.
6. The API returns JSON to React; no browser request is made to an internal service directly.

## Repository structure

```text
apps/
  api/
    src/
      server.ts              API process entrypoint
      app.ts                 Fastify composition root and shared response hooks
      config.ts              runtime settings and local defaults
      domain.ts              booking-access and coupon rules
      destination-pack.ts    supplier-pack loader
      challenge-flags.ts     in-memory challenge flag provider
      lib/                   request parsing, session guards, and audit writing
      routes/                route modules grouped by business capability
      security.ts            reusable cryptographic and network helpers
      types.ts               API types and Fastify request augmentation
  web/
    src/
      components/            reusable UI and modal components
      hooks/                 sessions, notifications, collections, and booking workflows
      pages/                 feature-level screens
      utils/                 display formatting helpers
      App.tsx                frontend composition and shared data flow
      api.ts                 same-origin HTTP client
      types.ts               API-facing view models
      main.tsx               React entrypoint
    public/                  local SVG branding and destination illustrations
services/
  fake-payment/              local payment simulator
  fake-mail/                 in-memory message simulator
  local-gateway/             loopback-only reverse proxy
database/
  migrations/                PostgreSQL schema
  seeds/                     fictional demonstration records
  fixtures/                  local destination-pack fixtures
tests/
  api/                       challenge, business, security, and web-client Vitest suites
compose.yaml                 final local topology
Dockerfile                   shared application image
package.json                 workspace build, test, and API development commands
vitest.config.ts             test discovery and Node.js environment
```

## Database initialization

Compose mounts the migration and seed files into PostgreSQL's `/docker-entrypoint-initdb.d/` directory:

```text
10_001_initial.sql
20_001_demo.sql
```

The official PostgreSQL entrypoint runs these files alphabetically only when its data directory is empty. Consequently:

- `docker compose down` preserves the data and does not replay SQL initialization;
- `docker compose down -v` removes the volume, so initialization runs on the next start;
- editing a seed does not change an existing volume automatically.

## Code organization

### API

`apps/api/src/server.ts` starts the HTTP process. `apps/api/src/app.ts` is the composition root: it configures Fastify, shared hooks, error handling, static frontend delivery, and route registration. Apply business-route changes in `apps/api/src/routes/`:

- `auth.ts`: accounts, sessions, and reset requests
- `catalog.ts`: destination data and trip search
- `profile.ts`: traveller information
- `bookings.ts`: booking lifecycle
- `payments.ts`: checkout and payment notifications
- `support.ts`: tickets and audit history
- `system.ts`: health and local operational endpoints
- `context.ts`: typed dependencies shared by the route modules

Shared request parsing (`readText`, `readEmail`, `isUuid`), authentication (`requireUser`, `requireRole`), and audit writing (`recordAudit`) live in `apps/api/src/lib/`. Route modules receive the pool, settings, guards, and flag provider through `RouteContext`, which keeps them testable without a running PostgreSQL instance.

### Web application

`apps/web/src/App.tsx` coordinates navigation and shared data. Rendering is split between:

- `components/` for reusable layout, feedback, authentication, and booking UI;
- `pages/` for catalogue, bookings, profile, support, and audit screens;
- `hooks/` for session restoration, transient notifications, catalogue/account collections, and booking workflows;
- `api.ts` for authenticated same-origin HTTP requests;
- `types.ts` for API-facing view models;
- `utils/` for deterministic presentation helpers.

The browser treats the API as the source of truth for authentication. Cached local browser state is cleared when the server no longer recognizes a session.

## Tests

Rebuild the application image after source or test edits, then run the complete Vitest suite inside it:

```bash
docker compose build app
docker compose run --rm --no-deps app npm test
```

Run all tests inside the Docker container. Do not install dependencies or run the test suite directly on the host machine. The image build installs the locked dependencies with `npm ci` and compiles every TypeScript workspace and the Vite frontend.

Audit the locked dependencies, including test tooling, from a temporary container:

```bash
docker run --rm holbietrips-app:local npm audit --package-lock-only --include=dev
```

The audit queries the npm advisory registry and requires network access. Rebuild the image before auditing an edited lockfile.

The suites under `tests/api/` use helpers and HTTP injection with PostgreSQL doubles; they do not validate a running Docker database or browser. Some challenge tests intentionally assert the initial vulnerable behaviour. For each remediation, add or update a security regression test and a positive business test. Convert the relevant characterization into a regression and preserve existing legitimate cases. A07 currently tests token helpers, A08 lacks a successful signed callback, and A10 covers normal rejection rather than successful confirmation; these need business-path coverage. Update test doubles when queries, transactions, or configuration change, then run the complete suite and verify the affected flow in Docker.

## Development workflow

The final Compose setup copies source code into the image and intentionally uses no source-code bind mount. A typical edit-and-test loop is:

```bash
docker compose build app
docker compose run --rm --no-deps app npm test
docker compose up --build -d
```

After rebuilding, refresh <http://127.0.0.1:8080>. Database data remains intact unless the named volume is explicitly removed.

Use `docker compose run --rm --no-deps app npm test` for tests that use database doubles without starting the other services. For manual verification, use the full Compose environment and the loopback URL above. Node.js 24 and the required tools are supplied by the image; no local Node.js installation is needed.

## Configuration

`.env.example` documents the fictional values used by the lab. Compose supplies the local settings directly to its services, so copying the file is not required for standard startup. The API does not load a `.env` file itself, and this Compose file has no `env_file` or variable substitution for these settings: editing `.env.example` or copying it to `.env` does not change the container configuration. Change the explicit Compose environment values when an exercise requires it.

These values are deliberately non-production credentials. Do not replace them with real secrets or reuse them outside the lab.

## Challenge flags

Exact flags are not committed or stored in PostgreSQL or the JSON fixtures. Each `buildApp()` instance creates a random secret and derives flags when the corresponding runtime condition is reached. In the standard server they remain stable until the `app` process restarts. Capture the flag before rebuilding or restarting; source and seed searches cannot recover its runtime value. Some flags appear only in the immediate action response, so retain that HTTP response as evidence.

The seeded Bruno booking is shared by access-control and payment exercises. Cancelling a booking or resetting a password also changes subsequent scenarios. Use the documented data reset when a challenge requires fresh demonstration state; sign in again afterwards. Coupon demonstrations depend on the seeded validity window (2026-01-01 through 2028-01-01) and remaining uses.

This prevents accidental source-code spoilers; it is not a security boundary against the owner of the local Docker environment.

## Safety boundaries

- Keep the published address bound to `127.0.0.1`.
- Do not add real providers, credentials, personal data, or payment details.
- Do not publish internal service ports.
- Do not enable host networking.
- Do not mount the Docker socket.
- Do not deploy this application to a public or shared environment.
- Use only the fictional records supplied by the repository.
