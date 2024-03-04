import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { getDatabaseUrl } from "@/utils";
import * as schema from "./schema";

export const db = drizzle(new Pool({ connectionString: getDatabaseUrl() }), {
  schema,
  logger: process.env.NODE_ENV === "development",
});
