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
pnpm exec prisma generate
pnpm exec prisma migrate dev   # or: prisma db push
pnpm dev
```

- **Health:** `GET http://localhost:<PORT>/health`
- **Register user:** `POST /api/v1/users` with JSON `{ "name", "email", "password" }`

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Dev server with `NODE_ENV=development` |
| `pnpm start` | Production mode entry |
| `pnpm run typecheck` | `tsc --noEmit` |
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
