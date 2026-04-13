import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    poolOptions: { threads: { singleThread: true } },
    env: {
      DATABASE_URL:
        process.env.DATABASE_URL ??
        "postgresql://test:test@127.0.0.1:5432/testdb?sslmode=disable",
      DIRECT_URL:
        process.env.DIRECT_URL ??
        "postgresql://test:test@127.0.0.1:5432/testdb?sslmode=disable",
      JWT_SECRET:
        process.env.JWT_SECRET ?? "test-jwt-secret-for-vitest-only-min-32-chars",
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "1h",
    },
  },
});
