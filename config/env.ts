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

export const env = {
  NODE_ENV,
  PORT: Number(process.env.PORT) || 5500,
} as const;
