import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../generated/prisma/client.js";
import { env } from "../config/env.js";

if (!env.DATABASE_URL) {
  throw new Error(
    "Missing DATABASE_URL — set it in .env or .env.<development|production>.local (Neon pooled connection string).",
  );
}

const adapter = new PrismaNeon({ connectionString: env.DATABASE_URL });

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();

    console.log(`Connected to database in ${env.NODE_ENV} mode`);
  } catch (error) {
    console.log("Error connecting to the database", error);
  }
}

export default connectDatabase;
