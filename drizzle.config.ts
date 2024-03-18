import { defineConfig } from "drizzle-kit";
import { env } from "process";

export default defineConfig({
  driver: "turso",
  schema: "./drizzle/schema.ts",
  dbCredentials: {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    url: env.TURSO_CONNECTION_URL!,
    authToken: env.TURSO_AUTH_TOKEN,
  },
  tablesFilter: ["howIsYourMood_*"],
  verbose: true,
  strict: true,
});
