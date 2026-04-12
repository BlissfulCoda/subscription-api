// Load the same layered env as the app (.env then .env.<NODE_ENV>.local)
import "./config/env.js";
import { defineConfig } from "prisma/config";

// Neon: use direct (non-pooler) URL for CLI; pooled URL is fine as fallback.
const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "Missing DATABASE_URL (and optional DIRECT_URL for Neon). Set them in .env or .env.development.local.",
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url,
  },
});
