# subscription-api

REST API for subscription-style data: **Express**, **TypeScript**, **Prisma 7**, **Neon (Postgres)** with the serverless driver, **Zod** validation, **Vitest** + Supertest, and **GitHub Actions** CI.

License: [MIT](LICENSE).

## Implemented today

- **Layered env** (`.env` + `.env.<development|production>.local`) via `config/env.ts`
- **Neon + Prisma** with `@prisma/adapter-neon`; in **Node** the Neon serverless driver needs the **`ws`** WebSocket implementation (`neonConfig.webSocketConstructor` in `database/neondb.ts`). Prisma CLI uses `DIRECT_URL` when set (`prisma.config.ts`)
- **`POST /api/v1/users`**: Zod validation → **bcryptjs** password hash → `prisma.user.create` → duplicate email → **409**
- **`POST /api/v1/auth/sign-in`**, **`POST /api/v1/auth/sign-up`**: Zod → bcrypt verify / create → **JWT** access token; **`POST /api/v1/auth/sign-out`**: stateless ack (client discards token)
- **Global JSON error shape** + **`express.json()`** + **`GET /health`**
- **Subscription routes**: mostly stubs

## Not implemented yet (roadmap)

- Refresh tokens, server-side session revocation, password reset
- Stripe (or other) billing and webhooks
- Background jobs for renewals / status reconciliation

## Requirements

- Node **20+** (CI uses **22**)
- [pnpm](https://pnpm.io/) **10** (see `packageManager` in `package.json`; this repo is **`pnpm-lock.yaml`-only** — use `pnpm install`, not `npm install`, so CI stays reproducible)
- A **Neon** database and connection strings (`DATABASE_URL` + optional `DIRECT_URL`)

## Environment variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Pooled Neon URL for the **running app** (and Prisma client) |
| `DIRECT_URL` | Direct Neon URL (no `-pooler`) for **`prisma migrate`** / `db push` — optional at runtime |
| `JWT_SECRET` | Secret for signing access tokens (**required** for auth routes in real runs) |
| `JWT_EXPIRES_IN` | Optional token lifetime (e.g. `7d`, `3600`); defaults to **`7d`** if unset or empty |
| `NODE_ENV` | `development` \| `production` — set by `pnpm dev` / `pnpm start` |

Copy `.env.example` patterns into `.env` and `.env.development.local` as needed.

## Setup

```bash
pnpm install
pnpm exec prisma generate   # required for `generated/prisma` (gitignored); `pnpm run typecheck` runs this too
pnpm exec prisma migrate deploy   # apply `prisma/migrations/*` to Neon (needs DIRECT_URL)
pnpm dev
```

For **local schema iteration** you can use `pnpm exec prisma migrate dev` instead of `deploy`; for an **empty Neon DB** matching this repo, `migrate deploy` is enough.

`DATABASE_URL` / `DIRECT_URL` must be set (see above) so `prisma generate` and `prisma.config.ts` can load.

### GitHub Actions

CI reads **`DATABASE_URL`** (and optional **`DIRECT_URL`**) from repository [**Variables**](https://docs.github.com/en/actions/learn-github-actions/variables) or [**Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions). The workflow prefers `secrets.*` when set, otherwise `vars.*`. Use a **Secret** if the URL contains a password.

**Fork pull requests:** GitHub does not pass repository secrets to workflows from forks by default, so CI may fail on external forks unless you adjust workflow permissions or use a non-secret test strategy. Pushes to branches in **this** repo are unaffected.

## Trying the API

Use **Postman**, **Insomnia**, **curl**, **[HTTPie](https://httpie.io/)**, or any HTTP client you like. Base URL: `http://localhost:<PORT>` (see `PORT` in your env).

Quick local routes:

- **Health:** `GET /health`
- **Register user:** `POST /api/v1/users` with JSON `{ "name", "email", "password" }`
- **Auth:** `POST /api/v1/auth/sign-in`, `POST /api/v1/auth/sign-up`, `POST /api/v1/auth/sign-out` (see `routes/auth.routes.ts`)

Example with HTTPie after `pnpm dev`:

```bash
http GET localhost:5500/health
http POST localhost:5500/api/v1/users name="Alice" email="alice@example.com" password="secret12"
http POST localhost:5500/api/v1/auth/sign-in email="alice@example.com" password="secret12"
```

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Dev server with `NODE_ENV=development` |
| `pnpm start` | Production mode entry |
| `pnpm run typecheck` | `prisma generate` then `tsc --noEmit` |
| `pnpm run lint` | ESLint |
| `pnpm test` | Vitest + Supertest |

## Architecture (short)

- **`app.ts`** — `createApp()` (HTTP stack only; used in tests)
- **`index.ts`** — connects DB, then `listen`
- **`routes/`** — HTTP adapters (thin)
- **`services/`** — use-cases (e.g. `createUser`)
- **`models/`** — Zod schemas + small domain helpers
- **`prisma/schema.prisma`** — database model

Prisma client is generated under `generated/prisma` (gitignored); run **`prisma generate`** after clone or schema change.
