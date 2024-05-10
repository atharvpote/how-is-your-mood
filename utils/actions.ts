"use server";

// TODO: Use revalidatePath() in actions when revalidation of client-side Router Cache for specific path is supported

import { getCurrentUserId } from "./auth";
import { Analysis, Metadata } from "./types";
import { PREVIEW_LENGTH, getCurrentTimestamp } from ".";
import { getAiAnalysis } from "./ai";
import { db } from "@/drizzle/db";
import { desc, eq, sql } from "drizzle-orm";
import { journal } from "@/drizzle/schema";
import { deleteVectorDocs, insertVectorDocs } from "@/vectorDb/utils";

// ANCHOR: Get Actions
export async function getEntry(id: string) {
  const [entry] = await db
    .select({
      content: journal.content,
      date: journal.date,
      embedded: journal.embedded,
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

  if (!entry) throw new Error("Journal entry not found");

  return entry;
}

export async function getEntries() {
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

export async function getMostRecentEntry() {
  const [entry] = await db
    .select({ date: journal.date })
    .from(journal)
    .where(eq(journal.userId, await getCurrentUserId()))
    .orderBy(desc(journal.date))
    .limit(1);

  return entry;
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
export async function createEntry() {
  const userId = await getCurrentUserId();

  const [entry] = await db
    .insert(journal)
    .values({ userId })
    .returning({ id: journal.id });

  if (!entry) throw new Error("Failed to create Journal entry");

  return entry.id;
}

// ANCHOR: Update Actions
export async function updateEntry(
  id: string,
  content: string,
  analysis?: Analysis,
) {
  const userId = await getCurrentUserId();

  const entry = await db.transaction(async (tx) => {
    const [entry] = await tx
      .update(journal)
      .set(
        setUpdatedAt({
          content,
          preview: createEntryPreview(content),
          ...(analysis ?? (await getAnalysis(content))),
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

    if (!entry) {
      tx.rollback();

      console.log("failed to update journal entry");

      throw new Error("Failed to update Journal entry");
    }

    try {
      await updateEmbeddings({ ...entry, content, userId });
    } catch (error: unknown) {
      tx.rollback();

      console.log("failed to update embeddings");

      handleTransactionError(error);
    }

    try {
      await tx
        .update(journal)
        .set({ embedded: 1 })
        .where(sql`${journal.id} = ${id} and ${journal.userId} = ${userId}`);
    } catch (error) {
      tx.rollback();

      throw new Error("Failed to update Journal entry embedded status");
    }

    return entry;
  });

  const updatedAnalysis: Analysis = {
    emoji: entry.emoji,
    mood: entry.mood,
    sentiment: entry.sentiment,
    subject: entry.subject,
    summery: entry.summery,
  };

  return updatedAnalysis;
}

export async function updateEntryDate(id: string, date: Date) {
  const userId = await getCurrentUserId();

  await db.transaction(async (tx) => {
    const [entry] = await tx
      .update(journal)
      .set(setUpdatedAt({ date: date.getTime() }))
      .where(
        sql`${journal.id} = ${id} and ${journal.userId} = ${await getCurrentUserId()}`,
      )
      .returning({
        date: journal.date,
        id: journal.id,
        createdAt: journal.createdAt,
        updatedAt: journal.updatedAt,
        content: journal.content,
        summery: journal.summery,
        mood: journal.mood,
        sentiment: journal.sentiment,
        subject: journal.subject,
        userId: journal.userId,
      });

    if (!entry) {
      tx.rollback();

      throw new Error("Failed to mutate Journal entry date");
    }

    try {
      await updateEmbeddings({ ...entry, userId });
    } catch (error) {
      tx.rollback();

      handleTransactionError(error);
    }
  });
}

// ANCHOR: Delete Actions
export async function deleteEntry(id: string) {
  const userId = await getCurrentUserId();

  await db.transaction(async (tx) => {
    const [entryId] = await tx
      .delete(journal)
      .where(sql`${journal.id} = ${id} and ${journal.userId} = ${userId}`)
      .returning({ id: journal.id });

    if (!entryId) {
      tx.rollback();

      throw new Error("Failed to delete Journal entry");
    }
    try {
      await deleteVectorDocs(userId, id);
    } catch (error) {
      tx.rollback();

      handleTransactionError(error);
    }
  });
}

// ANCHOR: Action Utils
async function updateEmbeddings(journal: Metadata) {
  await deleteVectorDocs(journal.userId, journal.id);

  await insertVectorDocs(journal);
}

function createEntryPreview(content: string) {
  return content.substring(0, PREVIEW_LENGTH);
}

async function getAnalysis(content: string) {
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

function handleTransactionError(error: unknown) {
  if (error instanceof Error) throw new Error(error.message);

  throw new Error(`Unknown error: ${String(error)}`);
}
