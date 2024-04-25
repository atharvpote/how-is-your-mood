import { migrate } from "drizzle-orm/libsql/migrator";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(__dirname, "../.env.local"),
});

async function migration() {
  console.log("initializing client");

  const client = createClient(getClientConfig());

  const db = drizzle(client);

  console.log("starting migration");

  await migrate(db, { migrationsFolder: "drizzle/migrations" });

  console.log("migration finished");

  process.exit(0);
}

migration().catch((error: unknown) => {
  console.error("migration failed", error);

  process.exit(1);
});

function getClientConfig() {
  if (process.argv[2] === "dev") {
    const { TURSO_CONNECTION_URL_DEV, TURSO_AUTH_TOKEN_DEV } = process.env;

    if (!TURSO_CONNECTION_URL_DEV || !TURSO_AUTH_TOKEN_DEV)
      throw new Error(
        "Please add TURSO_CONNECTION_URL_DEV and TURSO_AUTH_TOKEN_DEV to .env or .env.local",
      );

    return {
      url: TURSO_CONNECTION_URL_DEV,
      authToken: TURSO_AUTH_TOKEN_DEV,
    };
  } else {
    const { TURSO_CONNECTION_URL, TURSO_AUTH_TOKEN } = process.env;

    if (!TURSO_CONNECTION_URL || !TURSO_AUTH_TOKEN)
      throw new Error(
        "Please add TURSO_CONNECTION_URL and TURSO_AUTH_TOKEN to .env or .env.local",
      );

    return {
      url: TURSO_CONNECTION_URL,
      authToken: TURSO_AUTH_TOKEN,
    };
  }
}
