import {
  date,
  pgTableCreator,
  real,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

const pgTable = pgTableCreator((name) => `howIsYourMood_${name}`);

export const user = pgTable("User", {
  id: varchar("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
  createdAt: timestamp("createdAt", {
    mode: "string",
    precision: 3,
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updatedAt", {
    mode: "string",
    precision: 3,
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  clerkId: varchar("clerkId", { length: 36 }).unique().notNull(),
  email: varchar("email", { length: 320 }).unique().notNull(),
});

export const journal = pgTable("Journal", {
  id: varchar("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
  createdAt: timestamp("createdAt", {
    mode: "string",
    precision: 3,
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updatedAt", {
    mode: "string",
    precision: 3,
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  content: text("content").default("").notNull(),
  date: date("date", { mode: "string" }).defaultNow().notNull(),
  preview: varchar("preview", { length: 191 }).default("").notNull(),

  userId: varchar("userId", { length: 36 }).references(() => user.id, {
    onDelete: "cascade",
  }),
});

export const analysis = pgTable("Analysis", {
  id: varchar("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
  createdAt: timestamp("createdAt", {
    mode: "string",
    precision: 3,
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updatedAt", {
    mode: "string",
    precision: 3,
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  emoji: varchar("emoji", { length: 191 }).default("").notNull(),
  mood: varchar("mood", { length: 191 }).default("").notNull(),
  sentiment: real("sentiment"),
  subject: varchar("subject", { length: 191 }).default("").notNull(),
  summery: text("summery").default("").notNull(),

  entryId: varchar("entryId", { length: 36 }).references(() => journal.id, {
    onDelete: "cascade",
  }),
  userId: varchar("userId", { length: 36 }).references(() => user.id),
});

export type UserSelect = InferSelectModel<typeof user>;
export type JournalSelect = InferSelectModel<typeof journal>;
export type AnalysisSelect = InferSelectModel<typeof analysis>;

export const selectJournalDateSchema = createSelectSchema(journal, {
  content: z.undefined(),
  createdAt: z.undefined(),
  id: z.undefined(),
  preview: z.undefined(),
  updatedAt: z.undefined(),
  userId: z.undefined(),
});

export const selectAnalysisSchema = createSelectSchema(analysis, {
  createdAt: z.undefined(),
  updatedAt: z.undefined(),
  id: z.undefined(),
  entryId: z.undefined(),
  userId: z.undefined(),
});
