import bcrypt from "bcryptjs";
import { prisma } from "../database/neondb.js";
import { AppError, ConflictError } from "../lib/httpErrors.js";
import { isPrismaUniqueViolation } from "../lib/prismaErrors.js";
import { userCreateSchema, userSignInSchema } from "../models/users.model.js";

const BCRYPT_COST = 12;

export type PublicUser = {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

function toPublicUser(row: {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}): PublicUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function signInUser(
  body: unknown,
): Promise<{ user: PublicUser }> {
  const input = userSignInSchema.parse(body);
  const row = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (!row) {
    throw new AppError(
      401,
      "UNAUTHORIZED",
      "Invalid email or password.",
    );
  }
  const passwordOk = await bcrypt.compare(input.password, row.password);
  if (!passwordOk) {
    throw new AppError(
      401,
      "UNAUTHORIZED",
      "Invalid email or password.",
    );
  }
  return { user: toPublicUser(row) };
}

export async function createUser(
  body: unknown,
): Promise<{ user: PublicUser }> {
  const input = userCreateSchema.parse(body);
  const passwordHash = bcrypt.hashSync(input.password, BCRYPT_COST);

  try {
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: passwordHash,
      },
    });
    return { user: toPublicUser(user) };
  } catch (e: unknown) {
    if (isPrismaUniqueViolation(e)) {
      const target = e.meta?.target;
      const isEmail =
        target !== undefined &&
        (Array.isArray(target)
          ? target.some((f) => String(f).toLowerCase().includes("email"))
          : String(target).toLowerCase().includes("email"));
      throw new ConflictError(
        isEmail
          ? "A user with this email already exists."
          : "This record conflicts with an existing unique constraint.",
        e.meta,
      );
    }
    throw e;
  }
}
