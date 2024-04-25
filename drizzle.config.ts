import { defineConfig } from "drizzle-kit";
import { getDatabaseCredentials } from "./drizzle/db";

export default defineConfig({
  driver: "turso",
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dbCredentials: getDatabaseCredentials(),
  verbose: true,
  strict: true,
});
