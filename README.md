# subscription-api

REST API for subscription-style data: **Express**, **TypeScript**, **Prisma 7**, **Neon (Postgres)** with the serverless driver, **Zod** validation, **Vitest** + Supertest, and **GitHub Actions** CI.

License: [MIT](LICENSE).

## Current scope

- **Env:** `.env` plus `.env.<development|production>.local` (`config/env.ts`)
- **Data:** Prisma 7 + Neon (`@prisma/adapter-neon`, `ws` in `database/neondb.ts`); optional `DIRECT_URL` for Prisma CLI (`prisma.config.ts`)
- **`POST /api/v1/users`:** Zod → bcrypt hash → create user; duplicate email → **409**
- **Auth:** sign-in / sign-up → JWT; sign-out is client-side token discard
- **HTTP:** Helmet, JSON body parser, shared error JSON, **`GET /health`**
- **Rate limits:** optional Arcjet token-bucket (tighter on `/api/v1/auth`, looser on other `/api/v1/*`); no key or `VITEST=true` → middleware skips
- **Users API:** `GET /api/v1/users/me` and self-only `GET /api/v1/users/:id` with Bearer JWT; list-all users → **403**
- **Subscriptions:** routes scaffolded only

## Roadmap

- Refresh tokens, server-side session revocation, password reset; optional **extra** app-level limits (e.g. Redis) if you outgrow Arcjet defaults or need custom cross-service quotas
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
| `ARCJET_KEY` | Optional — enables Arcjet token-bucket rate limiting; omit for local/CI without Arcjet |
| `NODE_ENV` | `development` \| `production` — set by `pnpm dev` / `pnpm start` |

Copy `.env.example` patterns into `.env` and `.env.development.local` as needed. Arcjet is token-bucket only (`middleware/arcjet.middleware.ts`); omit `ARCJET_KEY` to run without it, or replace with an in-process limiter if you prefer.

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

CI loads `DATABASE_URL` (and optional `DIRECT_URL`) from repo Variables or Secrets (`secrets.*` wins over `vars.*`). Prefer Secrets when the URL includes credentials.

Fork PRs from other users often cannot read your secrets, so CI may fail there unless you change permissions or use a dedicated test setup. `pnpm test` sets `VITEST=true`, so Arcjet middleware does not run in tests even if `ARCJET_KEY` is set.

## Trying the API

Use any HTTP client. Base URL: `http://localhost:<PORT>` (default **5500** if `PORT` is unset).

Quick local routes:

- **Health:** `GET /health`
- **Register user:** `POST /api/v1/users` with JSON `{ "name", "email", "password" }`
- **Auth:** `POST /api/v1/auth/sign-in`, `POST /api/v1/auth/sign-up`, `POST /api/v1/auth/sign-out` (see `routes/auth.routes.ts`)
- **Current user (JWT):** `GET /api/v1/users/me` with header `Authorization: Bearer <access_token>`

Example with HTTPie after `pnpm dev`:

```bash
http GET localhost:5500/health
http POST localhost:5500/api/v1/users name="Alice" email="alice@example.com" password="secret12"
http POST localhost:5500/api/v1/auth/sign-in email="alice@example.com" password="secret12"
# copy access_token from JSON, then:
http GET localhost:5500/api/v1/users/me "Authorization: Bearer <paste_token_here>"
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
- **`middleware/`** — errors, **`requireAuth`**, Arcjet rate limits
- **`services/`** — use-cases (e.g. `createUser`)
- **`models/`** — Zod schemas + small domain helpers
- **`prisma/schema.prisma`** — database model

Prisma client is generated under `generated/prisma` (gitignored); run **`prisma generate`** after clone or schema change.
