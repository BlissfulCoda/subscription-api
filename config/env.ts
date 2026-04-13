import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";

const root = resolve(import.meta.dirname, "..");
const base = resolve(root, ".env");

if (existsSync(base)) config({ path: base });

const raw = process.env.NODE_ENV?.trim().toLowerCase();
const NODE_ENV = raw === "production" ? "production" : "development";

config({ path: resolve(root, `.env.${NODE_ENV}.local`), override: true });

process.env.NODE_ENV = NODE_ENV;

const DATABASE_URL = process.env.DATABASE_URL;
/** Neon direct host (no `-pooler`) — for Prisma CLI / migrations; optional at runtime. */
const DIRECT_URL = process.env.DIRECT_URL;
// JWT
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

export const env = {
  NODE_ENV,
  PORT: Number(process.env.PORT) || 5500,
  DATABASE_URL,
  DIRECT_URL,
  JWT_SECRET,
  JWT_EXPIRES_IN,
} as const;
