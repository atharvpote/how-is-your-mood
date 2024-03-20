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

  const client = createClient(
    process.argv[2] === "dev"
      ? {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          url: process.env.TURSO_CONNECTION_URL_DEV!,
          authToken: process.env.TURSO_AUTH_TOKEN_DEV,
        }
      : {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          url: process.env.TURSO_CONNECTION_URL!,
          authToken: process.env.TURSO_AUTH_TOKEN,
        },
  );

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
