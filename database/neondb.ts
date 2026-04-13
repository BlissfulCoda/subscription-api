import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import WebSocket from "ws";
import { PrismaClient } from "../generated/prisma/client.js";
import { env } from "../config/env.js";

if (!env.DATABASE_URL) {
  throw new Error(
    "Missing DATABASE_URL — set it in .env or .env.<development|production>.local (Neon pooled connection string).",
  );
}

/**
 * Neon’s serverless driver turns `DATABASE_URL` into a `wss://…` endpoint. If the host is
 * `localhost`, you get `wss://localhost/v2` and `ECONNREFUSED` — a common mis-copy from local Postgres templates.
 */
function assertNeonDatabaseHost(url: string): void {
  if (process.env.VITEST === "true") return;

  let hostname: string;
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    throw new Error(
      "DATABASE_URL is not a valid URL. Use the pooled string from the Neon dashboard (postgresql://…).",
    );
  }
  if (!hostname || hostname === "localhost" || hostname === "127.0.0.1") {
    throw new Error(
      "DATABASE_URL must not use localhost as the database host when using @prisma/adapter-neon — the driver will try wss://localhost/v2 and fail with ECONNREFUSED. " +
        "Paste Neon’s pooled connection string (hostname contains neon.tech or your project’s pooler host), not a local Postgres URL.",
    );
  }
}

assertNeonDatabaseHost(env.DATABASE_URL);

/** Required in Node for Neon's serverless driver (otherwise queries can fail with a bare `ErrorEvent`). */
neonConfig.webSocketConstructor = WebSocket;

const adapter = new PrismaNeon({ connectionString: env.DATABASE_URL });

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    /** Opens the Neon WebSocket path; `$connect` alone can succeed before the first query. */
    await prisma.$queryRawUnsafe("SELECT 1");
    console.log(`Connected to database in ${env.NODE_ENV} mode`);
  } catch (error) {
    console.error("Failed to connect to the database", error);
    throw error;
  }
}

export default connectDatabase;
