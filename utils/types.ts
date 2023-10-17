import { Analysis, Journal } from "@prisma/client";

export type ChartAnalysis = Pick<
  Analysis,
  "sentiment" | "date" | "mood" | "emoji"
>;

export type EntryAnalysis = Pick<
  Analysis,
  "sentiment" | "mood" | "emoji" | "subject" | "summery"
>;

export type Entry = Pick<Journal, "id" | "date" | "content">;
