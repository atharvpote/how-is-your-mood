import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

const client = createClient(getDatabaseCredentials());

export const db = drizzle(client);

export function getDatabaseCredentials() {
  if (process.env.VERCEL_ENV === "production")
    return {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      url: process.env.TURSO_CONNECTION_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    };

  return {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    url: process.env.TURSO_CONNECTION_URL_DEV!,
    authToken: process.env.TURSO_AUTH_TOKEN_DEV,
  };
}
