# Subscription API

Backend system for handling authentication, user access, and subscription-style data. Built with Node.js (Express), TypeScript, Prisma, and Neon Postgres.

The focus here is predictable behaviour under load: clear boundaries between HTTP, business logic, and data, with guardrails around auth, validation, and rate limiting.

---

## Overview

I structured this as a layered API rather than a collection of routes:

- Routes stay thin and only deal with HTTP concerns
- Services handle business logic and data access
- Middleware handles cross-cutting concerns (auth, validation, rate limiting)

The goal was to keep the system easy to extend without turning it into tightly coupled route logic.

---

## Key Decisions

- **Typed validation at the edge (Zod)**  
  I validate requests before they reach business logic so services can assume correct input.

- **JWT-based auth with RBAC boundaries**  
  Access is scoped per user; endpoints like `GET /users/:id` are explicitly self-only.

- **Rate limiting at the edge**  
  I use Arcjet token-bucket limits for now. It’s optional in local/test environments, but protects auth routes in production.

- **Separation of transactional vs future async work**  
  Subscriptions and billing flows are scaffolded with the expectation they move to background jobs later.

---

## Architecture

- **routes/**: HTTP layer only (Express handlers)
- **middleware/**: auth (`requireAuth`), error handling, rate limiting
- **services/**: business logic (e.g. create user, auth flow)
- **models/**: Zod schemas + small domain helpers
- **prisma/**: database schema

I keep Prisma behind the service layer so the rest of the app isn’t tightly coupled to the ORM.

---

## API Surface (current)

- `POST /api/v1/users`  
  Create user (Zod validation → bcrypt hash → insert). Duplicate email returns 409.

- `POST /api/v1/auth/sign-in` / `sign-up`  
  Returns JWT access token.

- `GET /api/v1/users/me`  
  Current user (Bearer token required)

- `GET /api/v1/users/:id`  
  Self-only access (enforced in middleware)

- `GET /health`  
  Basic health check

Subscriptions routes are scaffolded but not yet wired to billing.

---

## Data Layer

- **Prisma 7 + Neon Postgres (serverless driver)**
- `DATABASE_URL` used at runtime (pooled)
- `DIRECT_URL` used for migrations

I keep migrations separate from runtime connections so deploys don’t block on schema changes.

---

## Rate Limiting

- Token-bucket via Arcjet
- Tighter limits on auth routes
- Skipped in tests (`VITEST=true`) and when no key is present

If this needed to scale further, I’d move to Redis-backed limits for cross-instance coordination.

---

## Tradeoffs

- **JWT over sessions**  
  Simpler stateless auth, but no built-in revocation without extra work (planned via refresh tokens)

- **Arcjet over custom limiter**  
  Faster to ship, but less control than a Redis-backed system

- **Single service (no queues yet)**  
  Keeps the system simple now, but billing/reconciliation will need background workers later

- **Prisma abstraction**  
  Speeds up development, but adds an extra layer vs raw SQL when tuning queries

---

## Running locally

```bash
pnpm install
pnpm exec prisma generate
pnpm exec prisma migrate deploy
pnpm dev
