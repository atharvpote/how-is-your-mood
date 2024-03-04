import { defineConfig } from "drizzle-kit";
import { getDatabaseUrl } from "./utils";

export default defineConfig({
  driver: "pg",
  schema: "./drizzle/schema.ts",
  dbCredentials: { connectionString: getDatabaseUrl() },
  tablesFilter: ["howIsYourMood_*"],
  verbose: true,
  strict: true,
});
