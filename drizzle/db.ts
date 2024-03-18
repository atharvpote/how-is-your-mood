import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { env } from "process";

const client = createClient({
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  url: env.TURSO_CONNECTION_URL!,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  authToken: env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client);
