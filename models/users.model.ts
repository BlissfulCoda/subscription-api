import { z } from "zod";

/** Mirrors your Mongoose rules: Prisma holds columns + `@unique`; this holds messages + trim/lowercase/format. */
export const userCreateSchema = z.object({
  name: z
    .string({ required_error: "User Name is required" })
    .trim()
    .min(2, "User Name must be at least 2 characters")
    .max(50, "User Name must be at most 50 characters"),
  email: z
    .string({ required_error: "User Email is required" })
    .trim()
    .toLowerCase()
    .regex(/\S+@\S+\.\S+/, "Please fill a valid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters"),
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
