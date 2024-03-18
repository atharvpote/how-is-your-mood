"use server";

// TODO: Use revalidatePath() in actions when revalidation of client-side Router Cache for specific path is supported

import { getCurrentUserId } from "./auth";
import { JournalAnalysis } from "./types";
import { PREVIEW_LENGTH, getCurrentTimestamp } from ".";
import { getAiAnalysis } from "./ai";
import { db } from "@/drizzle/db";
import { desc, eq, sql } from "drizzle-orm";
import { journal } from "@/drizzle/schema";

export async function createJournalEntry() {
  const userId = await getCurrentUserId();

  const [entry] = await db
    .insert(journal)
    .values({ userId })
    .returning({ id: journal.id });

  if (!entry) throw new Error("Failed to create Journal entry");

  return entry.id;
}

export async function deleteJournalEntry(id: string) {
  const [journalId] = await db
    .delete(journal)
    .where(
      sql`${journal.id} = ${id} and ${journal.userId} = ${await getCurrentUserId()}`,
    )
    .returning({ id: journal.id });

  if (!journalId) throw new Error("Failed to delete Journal entry");
}

export async function mutateJournalEntry(
  id: string,
  content: string,
  journalAnalysis: JournalAnalysis,
) {
  const userId = await getCurrentUserId();

  const [journalId] = await db
    .update(journal)
    .set(
      setUpdatedAt({
        content,
        preview: createJournalPreview(content),
        ...journalAnalysis,
      }),
    )
    .where(sql`${journal.id} = ${id} and ${journal.userId} = ${userId}`)
    .returning({ id: journal.id });

  if (!journalId) throw new Error("Failed to mutate Journal entry");
}

export async function updateJournalEntry(id: string, content: string) {
  const userId = await getCurrentUserId();

  const [updatedAnalysis] = await db
    .update(journal)
    .set(
      setUpdatedAt({
        content,
        preview: createJournalPreview(content),
        ...(await getJournalAnalysis(content)),
      }),
    )
    .where(sql`${journal.id} = ${id} and ${journal.userId} = ${userId}`)
    .returning({
      emoji: journal.emoji,
      mood: journal.mood,
      sentiment: journal.sentiment,
      subject: journal.subject,
      summery: journal.summery,
    });

  if (!updatedAnalysis) throw new Error("Failed to update Journal entry");

  return updatedAnalysis;
}

export async function getJournalEntry(id: string) {
  const [journalEntry] = await db
    .select({
      content: journal.content,
      date: journal.date,
      emoji: journal.emoji,
      mood: journal.mood,
      sentiment: journal.sentiment,
      subject: journal.subject,
      summery: journal.summery,
    })
    .from(journal)
    .where(
      sql`${journal.id} = ${id} and ${journal.userId} = ${await getCurrentUserId()}`,
    )
    .limit(1);

  if (!journalEntry) throw new Error("Journal entry not found");

  return journalEntry;
}

export async function mutateJournalEntryDate(id: string, date: Date) {
  const [journalId] = await db
    .update(journal)
    .set(setUpdatedAt({ date: date.getTime() }))
    .where(
      sql`${journal.id} = ${id} and ${journal.userId} = ${await getCurrentUserId()}`,
    )
    .returning({ id: journal.id });

  if (!journalId) throw new Error("Failed to mutate Journal entry date");
}

export async function getJournalEntries() {
  const journalEntries = await db
    .select({
      date: journal.date,
      id: journal.id,
      preview: journal.preview,
    })
    .from(journal)
    .where(eq(journal.userId, await getCurrentUserId()))
    .orderBy(desc(journal.date));

  return journalEntries;
}

export async function getMostRecentJournalEntry() {
  const [journalEntry] = await db
    .select({ date: journal.date })
    .from(journal)
    .where(eq(journal.userId, await getCurrentUserId()))
    .orderBy(desc(journal.date))
    .limit(1);

  return journalEntry;
}

export async function getChartAnalyses(start: Date, end: Date) {
  const chartAnalyses = await db
    .select({
      date: journal.date,
      emoji: journal.emoji,
      mood: journal.mood,
      sentiment: journal.sentiment,
    })
    .from(journal)
    .where(
      sql`((${journal.userId}=${await getCurrentUserId()}) and (${journal.date} between ${start} and ${end}))`,
    );

  return chartAnalyses;
}

function createJournalPreview(content: string) {
  return content.substring(0, PREVIEW_LENGTH);
}

async function getJournalAnalysis(content: string) {
  return !content.trim()
    ? {
        emoji: "",
        mood: "",
        sentiment: null,
        subject: "",
        summery: "",
      }
    : await getAiAnalysis(content);
}

function setUpdatedAt<T extends object>(data: T) {
  return { ...data, updatedAt: getCurrentTimestamp() };
}
