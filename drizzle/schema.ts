import {
  integer,
  real,
  sqliteTableCreator,
  text,
} from "drizzle-orm/sqlite-core";
import { InferSelectModel } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { getCurrentTimestamp } from "@/utils";

// TODO: add index on fields to improve performance

const sqlLiteTable = sqliteTableCreator((name) => `howIsYourMood_${name}`);

export const user = sqlLiteTable("User", {
  id: text("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
  createdAt: integer("createdAt").$defaultFn(getCurrentTimestamp).notNull(),
  updatedAt: integer("updatedAt").$defaultFn(getCurrentTimestamp).notNull(),
  clerkId: text("clerkId", { length: 36 }).unique().notNull(),
  email: text("email", { length: 320 }).unique().notNull(),
});

export type UserSelect = InferSelectModel<typeof user>;

export const journal = sqlLiteTable("Journal", {
  id: text("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
  createdAt: integer("createdAt").$defaultFn(getCurrentTimestamp).notNull(),
  updatedAt: integer("updatedAt").$defaultFn(getCurrentTimestamp).notNull(),
  date: integer("date").$defaultFn(getCurrentTimestamp).notNull(),
  content: text("content").default("").notNull(),
  preview: text("preview").default("").notNull(),
  summery: text("summery").default("").notNull(),
  mood: text("mood").default("").notNull(),
  subject: text("subject").default("").notNull(),
  sentiment: real("sentiment"),
  emoji: text("emoji").default("").notNull(),

  userId: text("userId", { length: 36 }).references(() => user.id, {
    onDelete: "cascade",
  }),
});

export type JournalSelect = InferSelectModel<typeof journal>;
