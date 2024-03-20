import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { getDatabaseCredentials } from "@/utils/db";

const client = createClient(getDatabaseCredentials());

export const db = drizzle(client);
