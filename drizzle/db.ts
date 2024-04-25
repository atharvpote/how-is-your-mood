import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

const client = createClient(getDatabaseCredentials());

export const db = drizzle(client);

export function getDatabaseCredentials() {
  if (process.env.VERCEL_ENV === "production") {
    const { TURSO_CONNECTION_URL, TURSO_AUTH_TOKEN } = process.env;

    if (!TURSO_CONNECTION_URL || !TURSO_AUTH_TOKEN) {
      throw new Error(
        "Please add TURSO_CONNECTION_URL and TURSO_AUTH_TOKEN to .env or .env.local",
      );
    }

    return {
      url: TURSO_CONNECTION_URL,
      authToken: TURSO_AUTH_TOKEN,
    };
  }

  const { TURSO_CONNECTION_URL_DEV, TURSO_AUTH_TOKEN_DEV } = process.env;

  if (!TURSO_CONNECTION_URL_DEV || !TURSO_AUTH_TOKEN_DEV) {
    throw new Error(
      "Please add TURSO_CONNECTION_URL_DEV and TURSO_AUTH_TOKEN_DEV to .env or .env.local",
    );
  }

  return {
    url: TURSO_CONNECTION_URL_DEV,
    authToken: TURSO_AUTH_TOKEN_DEV,
  };
}
