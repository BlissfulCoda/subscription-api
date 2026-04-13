# subscription-api

REST API for subscription-style data, built with **Express**, **TypeScript**, **Prisma 7**, **Neon (Postgres)**, and **Zod** for request validation.

## Implemented today

- **Layered env** (`.env` + `.env.<development|production>.local`) via `config/env.ts`
- **Neon + Prisma** with `@prisma/adapter-neon`; Prisma CLI uses `DIRECT_URL` when set (`prisma.config.ts`)
- **`POST /api/v1/users`**: Zod validation → **bcryptjs** password hash → `prisma.user.create` → duplicate email → **409**
- **Global JSON error shape** + **`express.json()`** + **`GET /health`**
- **Subscription / auth routes**: mostly stubs; auth actions return **501** until implemented

## Not implemented yet (roadmap)

- JWT / sessions, sign-in flows, password reset
- Stripe (or other) billing and webhooks
- Background jobs for renewals / status reconciliation

## Requirements

- Node **20+** (repo uses **22** in CI)
- [pnpm](https://pnpm.io/) **9+**
- A **Neon** (or Postgres) database and connection strings

## Environment variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Pooled Neon URL for the **running app** (and Prisma client) |
| `DIRECT_URL` | Direct Neon URL (no `-pooler`) for **`prisma migrate`** / `db push` — optional at runtime |
| `NODE_ENV` | `development` \| `production` — set by `pnpm dev` / `pnpm start` |

Copy `.env.example` patterns into `.env` and `.env.development.local` as needed.

## Setup

```bash
pnpm install
pnpm exec prisma generate   # required for `generated/prisma` (gitignored); `pnpm run typecheck` runs this too
pnpm exec prisma migrate dev   # or: prisma db push
pnpm dev
```

`DATABASE_URL` / `DIRECT_URL` must be set (see above) so `prisma generate` and `prisma.config.ts` can load.

### GitHub Actions

CI reads **`DATABASE_URL`** (and optional **`DIRECT_URL`**) from repository [**Variables**](https://docs.github.com/en/actions/learn-github-actions/variables) or [**Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions). The workflow prefers `secrets.*` when set, otherwise `vars.*`. Use a **Secret** if the URL contains a password.

- **Health:** `GET http://localhost:<PORT>/health`
- **Register user:** `POST /api/v1/users` with JSON `{ "name", "email", "password" }`

## Trying the API

Use **Postman**, **Insomnia**, **curl**, **[HTTPie](https://httpie.io/)**, or any HTTP client you like. Base URL: `http://localhost:<PORT>` (see `PORT` in your env).

Example with HTTPie after `pnpm dev`:

```bash
http GET localhost:5500/health
http POST localhost:5500/api/v1/users name="Alice" email="alice@example.com" password="secret12"
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
