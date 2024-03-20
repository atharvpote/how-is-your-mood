import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";
import { InferSelectModel } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { getCurrentTimestamp } from "@/utils";

// TODO: add index on fields to improve performance

export const user = sqliteTable(
  "User",
  {
    id: text("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
    createdAt: integer("createdAt").$defaultFn(getCurrentTimestamp).notNull(),
    updatedAt: integer("updatedAt").$defaultFn(getCurrentTimestamp).notNull(),
    clerkId: text("clerkId", { length: 36 }).unique().notNull(),
    email: text("email", { length: 320 }).unique().notNull(),
  },
  ({ clerkId }) => ({ clerkIdIdx: index("clerkId_idx").on(clerkId) }),
);

export type UserSelect = InferSelectModel<typeof user>;

export const journal = sqliteTable(
  "Journal",
  {
    id: text("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
    createdAt: integer("createdAt").$defaultFn(getCurrentTimestamp).notNull(),
    updatedAt: integer("updatedAt").$defaultFn(getCurrentTimestamp).notNull(),
    content: text("content").default("").notNull(),
    date: integer("date").$defaultFn(getCurrentTimestamp).notNull(),
    preview: text("preview").default("").notNull(),
    summery: text("summery").default("").notNull(),
    mood: text("mood").default("").notNull(),
    subject: text("subject").default("").notNull(),
    sentiment: real("sentiment"),
    emoji: text("emoji").default("").notNull(),
    embedded: integer("embedded").$type<0 | 1>().default(0).notNull(),

    userId: text("userId", { length: 36 }).references(() => user.id, {
      onDelete: "cascade",
    }),
  },
  ({ date, id, userId }) => ({
    dateIdx: index("date_idx").on(date),
    idUserIdIdx: unique("id_userId_idx").on(id, userId),
    userIdIdx: index("usedId_idx").on(userId),
    userIdDateIdx: index("usedId_date_idx").on(userId, date),
  }),
);

export type JournalSelect = InferSelectModel<typeof journal>;
