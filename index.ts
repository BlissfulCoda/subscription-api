import { createApp } from "./app.js";
import { env } from "./config/env.js";
import connectDatabase from "./database/neondb.js";

const app = createApp();

async function main(): Promise<void> {
  await connectDatabase();
  app.listen(env.PORT, () => {
    console.log(
      `Subscription API listening on http://localhost:${String(env.PORT)} (${env.NODE_ENV})`,
    );
  });
}

main().catch((err: unknown) => {
  console.error("Server failed to start", err);
  process.exit(1);
});


