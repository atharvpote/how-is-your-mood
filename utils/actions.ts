"use server";

// TODO: Use revalidatePath() in actions when revalidation of client-side Router Cache for specific path is supported

import { getCurrentUserId } from "./auth";
import { JournalAnalysis, JournalMetadata } from "./types";
import { PREVIEW_LENGTH, getCurrentTimestamp } from ".";
import { getAiAnalysis, getEmbeddings } from "./ai";
import { db } from "@/drizzle/db";
import { desc, eq, sql } from "drizzle-orm";
import { journal } from "@/drizzle/schema";
import {
  deleteEmbeddings,
  insertEmbeddings,
  mutateEmbeddingsMetadataDate,
} from "@/vectorDb/utils";

// ANCHOR: Get Actions
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

export async function getJournalEntries() {
  return await db
    .select({
      date: journal.date,
      id: journal.id,
      preview: journal.preview,
    })
    .from(journal)
    .where(eq(journal.userId, await getCurrentUserId()))
    .orderBy(desc(journal.date));
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
  return await db
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
}

// ANCHOR: Create Actions
export async function createJournalEntry() {
  const userId = await getCurrentUserId();

  const [entry] = await db
    .insert(journal)
    .values({ userId })
    .returning({ id: journal.id });

  if (!entry) throw new Error("Failed to create Journal entry");

  return entry.id;
}

// ANCHOR: Update Actions
export async function updateJournalEntry(id: string, content: string) {
  const userId = await getCurrentUserId();

  const journalEntry = await db.transaction(async (tx) => {
    const [journalEntry] = await tx
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
        createdAt: journal.createdAt,
        date: journal.date,
        emoji: journal.emoji,
        id: journal.id,
        mood: journal.mood,
        sentiment: journal.sentiment,
        subject: journal.subject,
        summery: journal.summery,
        updatedAt: journal.updatedAt,
      });

    if (!journalEntry) {
      tx.rollback();

      throw new Error("Failed to update Journal entry");
    }

    try {
      await updateEmbeddings(content, { ...journalEntry, userId });
    } catch (error: unknown) {
      tx.rollback();

      if (error instanceof Error) throw new Error(error.message);

      throw new Error(`Unknown error: ${String(error)}`);
    }

    return journalEntry;
  });

  const updatedAnalysis: JournalAnalysis = {
    emoji: journalEntry.emoji,
    mood: journalEntry.mood,
    sentiment: journalEntry.sentiment,
    subject: journalEntry.subject,
    summery: journalEntry.summery,
  };

  return updatedAnalysis;
}

// ANCHOR: Mutate Actions
export async function mutateJournalEntry(
  id: string,
  content: string,
  journalAnalysis: JournalAnalysis,
) {
  const userId = await getCurrentUserId();

  await db.transaction(async (tx) => {
    const [journalEntry] = await tx
      .update(journal)
      .set(
        setUpdatedAt({
          content,
          preview: createJournalPreview(content),
          ...journalAnalysis,
        }),
      )
      .where(sql`${journal.id} = ${id} and ${journal.userId} = ${userId}`)
      .returning({
        createdAt: journal.createdAt,
        date: journal.date,
        id: journal.id,
        mood: journal.mood,
        sentiment: journal.sentiment,
        subject: journal.subject,
        summery: journal.summery,
        updatedAt: journal.updatedAt,
      });

    if (!journalEntry) {
      tx.rollback();

      throw new Error("Failed to mutate Journal entry");
    }

    try {
      await updateEmbeddings(content, { ...journalEntry, userId });
    } catch (error: unknown) {
      tx.rollback();

      if (error instanceof Error) throw new Error(error.message);

      throw new Error(`Unknown error: ${String(error)}`);
    }
  });
}

export async function mutateJournalEntryDate(id: string, date: Date) {
  const userId = await getCurrentUserId();

  await db.transaction(async (tx) => {
    const [journalEntry] = await tx
      .update(journal)
      .set(setUpdatedAt({ date: date.getTime() }))
      .where(
        sql`${journal.id} = ${id} and ${journal.userId} = ${await getCurrentUserId()}`,
      )
      .returning({ id: journal.id });

    if (!journalEntry) {
      tx.rollback();

      throw new Error("Failed to mutate Journal entry date");
    }

    const embeddingsMutateResult = await mutateEmbeddingsMetadataDate(
      date,
      userId,
      journalEntry.id,
    );

    if (!embeddingsMutateResult.acknowledged) {
      tx.rollback();

      throw new Error("Failed to mutate embeddings metadata date");
    }
  });
}

// ANCHOR: Delete Actions
export async function deleteJournalEntry(id: string) {
  const userId = await getCurrentUserId();

  await db.transaction(async (tx) => {
    const [journalId] = await tx
      .delete(journal)
      .where(sql`${journal.id} = ${id} and ${journal.userId} = ${userId}`)
      .returning({ id: journal.id });

    if (!journalId) {
      tx.rollback();

      throw new Error("Failed to delete Journal entry");
    }

    const deleteEmbeddingsResult = await deleteEmbeddings(userId, id);

    if (!deleteEmbeddingsResult.acknowledged) {
      tx.rollback();

      throw new Error("Failed to delete journal embeddings");
    }
  });
}

// ANCHOR: Action Utils
async function updateEmbeddings(content: string, journal: JournalMetadata) {
  const deleteEmbeddingsResult = await deleteEmbeddings(
    journal.userId,
    journal.id,
  );

  if (!deleteEmbeddingsResult.acknowledged)
    throw new Error("Failed to delete embeddings");

  const insertEmbeddingsResult = await insertEmbeddings(
    journal,
    await getEmbeddings(content),
  );

  if (!insertEmbeddingsResult.acknowledged)
    throw new Error("Failed to insert embeddings");
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
