import { Prisma } from "../generated/prisma/client.js";

export function isPrismaUniqueViolation(
  e: unknown,
): e is Prisma.PrismaClientKnownRequestError {
  return (
    e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002"
  );
}
