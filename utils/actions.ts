"use server";

// TODO: Use revalidatePath() in actions when revalidation of client-side Router Cache for specific path is supported

import { getCurrentUserId } from "./auth";
import { Analysis } from "./types";
import { PREVIEW_LENGTH } from ".";
import { getAiAnalysis } from "./ai";
import { db } from "@/drizzle/db";
import { asc, desc, eq, sql } from "drizzle-orm";
import { analysis, journal, selectJournalDateSchema } from "@/drizzle/schema";

export async function createEntry() {
  const id = await db.transaction(async (tx) => {
    const userId = await getCurrentUserId();

    const [entry] = await tx
      .insert(journal)
      .values({ userId })
      .returning({ id: journal.id });

    if (!entry) {
      tx.rollback();

      return;
    }

    await tx.insert(analysis).values({ userId, entryId: entry.id }).returning({
      id: analysis.id,
    });

    return entry.id;
  });

  if (!id) throw new Error("Failed to create entry");

  return id;
}

export async function deleteEntry(id: string) {
  await db
    .delete(journal)
    .where(
      sql`${journal.id} = ${id} and ${journal.userId} = ${await getCurrentUserId()}`,
    );
}

export async function mutateEntry(
  id: string,
  content: string,
  updatedAnalysis: Analysis,
) {
  const userId = await getCurrentUserId();

  await db.transaction(async (tx) => {
    await tx
      .update(journal)
      .set({ content, preview: createPreview(content) })
      .where(sql`${journal.id} = ${id} and ${journal.userId} = ${userId}`);

    await tx
      .update(analysis)
      .set(updatedAnalysis)
      .where(
        sql`${analysis.entryId} = ${id} and ${analysis.userId} = ${userId}`,
      );
  });
}

export async function updateEntry(id: string, content: string) {
  const updatedData = await db.transaction(async (tx) => {
    const [entry] = await tx
      .update(journal)
      .set({ content, preview: createPreview(content) })
      .where(
        sql`${journal.id} = ${id} and ${journal.userId} = ${await getCurrentUserId()}`,
      )
      .returning({ id: journal.id });

    if (!entry) {
      tx.rollback();

      return;
    }

    const [data] = await db
      .update(analysis)
      .set(
        !content.trim()
          ? {
              emoji: "",
              mood: "",
              sentiment: null,
              subject: "",
              summery: "",
            }
          : await getAiAnalysis(content),
      )
      .where(
        sql`${analysis.entryId} = ${entry.id} and ${analysis.userId} = ${await getCurrentUserId()}`,
      )
      .returning({
        analysis: {
          emoji: analysis.emoji,
          mood: analysis.mood,
          sentiment: analysis.sentiment,
          subject: analysis.subject,
          summery: analysis.summery,
        },
      });

    if (!data) {
      tx.rollback();

      return;
    }

    return data.analysis;
  });

  if (!updatedData) throw new Error("Failed to update entry");

  return updatedData;
}

export async function getEntry(id: string) {
  const [entry] = await db
    .select({
      content: journal.content,
      date: journal.date,
      analysis: {
        emoji: analysis.emoji,
        mood: analysis.mood,
        sentiment: analysis.sentiment,
        subject: analysis.subject,
        summery: analysis.summery,
      },
    })
    .from(journal)
    .innerJoin(analysis, eq(analysis.entryId, journal.id))
    .where(eq(journal.id, id))
    .limit(1);

  if (!entry) throw new Error("Entry not found");

  return entry;
}

export async function mutateEntryDate(id: string, date: Date) {
  await db
    .update(journal)
    .set({ date: new Date(date).toDateString() })
    .where(
      sql`${journal.id} = ${id} and ${journal.userId} = ${await getCurrentUserId()}`,
    );
}

export async function getEntries() {
  const entries = await db
    .select({
      date: journal.date,
      id: journal.id,
      preview: journal.preview,
    })
    .from(journal)
    .where(eq(journal.userId, await getCurrentUserId()))
    .orderBy(desc(journal.date));

  return entries;
}

export async function getMostRecentEntryDate() {
  const [entry] = await db
    .select({ date: journal.date })
    .from(journal)
    .where(eq(journal.userId, await getCurrentUserId()))
    .orderBy(desc(journal.date))
    .limit(1);

  return entry?.date;
}

export async function getChartAnalyses(start: Date, end: Date) {
  const chartAnalyses = await db
    .select({
      emoji: analysis.emoji,
      mood: analysis.mood,
      sentiment: analysis.sentiment,
      journal: { date: journal.date },
    })
    .from(analysis)
    .innerJoin(journal, eq(analysis.entryId, journal.id))
    .where(
      sql`((${analysis.userId}=${await getCurrentUserId()}) and (${journal.date} between ${start} and ${end}))`,
    );

  return chartAnalyses;
}

function createPreview(content: string) {
  return content.substring(0, PREVIEW_LENGTH);
}
