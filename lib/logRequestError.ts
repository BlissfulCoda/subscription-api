import { inspect } from "node:util";
import { Prisma } from "../generated/prisma/client.js";

function logAggregateError(agg: AggregateError, label: string): void {
  const maybe = agg as unknown as { code?: unknown };
  const code = typeof maybe.code === "string" ? maybe.code : "";
  console.error(label, code ? `code: ${code}` : "", "message:", agg.message || "(empty)");
  agg.errors.forEach((e, i) => {
    console.error(`  cause[${String(i)}]:`, inspect(e, { depth: 4, colors: true }));
  });
}

/** Rich server logs — `ErrorEvent` from Neon/WebSocket often prints empty with `console.error(err)` alone. */
export function logRequestError(err: unknown): void {
  if (err instanceof AggregateError) {
    logAggregateError(err, "[AggregateError]");
    return;
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    console.error("[Prisma]", err.code, err.message, err.meta);
    return;
  }
  if (err instanceof Prisma.PrismaClientInitializationError) {
    console.error("[Prisma init]", err.errorCode, err.message);
    return;
  }
  if (err instanceof Error) {
    console.error(err.stack ?? err.message, err.cause ?? "");
    return;
  }
  if (typeof err === "object" && err !== null && "type" in err) {
    const ev = err as { type: string; error?: unknown; message?: string };
    if (ev.type === "error") {
      console.error("[ErrorEvent-like] message:", ev.message || "(empty)");
      if (ev.error instanceof AggregateError) {
        logAggregateError(ev.error, "  nested AggregateError");
      } else if (ev.error instanceof Error) {
        console.error("  nested:", ev.error.stack ?? ev.error.message);
      } else if (ev.error !== undefined) {
        console.error("  nested:", inspect(ev.error, { depth: 5, colors: true }));
      }
      return;
    }
  }
  console.error(inspect(err, { depth: 6, colors: true }));
}
