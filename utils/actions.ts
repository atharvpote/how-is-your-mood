"use server";

// TODO: Use revalidatePath() in actions when revalidation of client-side Router Cache for specific path is supported

import { getCurrentUserId } from "./auth";
import { prisma } from "./db";
import { setHours, setMinutes } from "date-fns";
import { Analysis } from "./types";
import { PREVIEW_LENGTH } from ".";
import { getAiAnalysis } from "./ai";

export async function createEntry() {
  const userId = await getCurrentUserId();

  return await prisma.$transaction(async (tx) => {
    const { id, date } = await tx.journal.create({
      data: {
        userId,
        content: "",
        date: normalizeTime(new Date()),
      },
      select: { id: true, date: true },
    });

    await tx.analysis.create({
      data: {
        emoji: "",
        mood: "",
        subject: "",
        summery: "",
        entryId: id,
        date,
        userId,
      },
    });

    return id;
  });
}

export async function deleteEntry(id: string) {
  await prisma.journal.delete({
    where: { userId_id: { userId: await getCurrentUserId(), id } },
  });
}

export async function mutateEntry(
  id: string,
  content: string,
  analysis: Analysis,
) {
  const userId = await getCurrentUserId();

  await prisma.$transaction(async (tx) => {
    await tx.journal.update({
      where: { userId_id: { userId, id } },
      data: { content, preview: createPreview(content) },
    });

    await tx.analysis.update({
      where: { entryId_userId: { entryId: id, userId } },
      data: analysis,
    });
  });
}

export async function updateEntry(id: string, content: string) {
  return await prisma.$transaction(async (tx) => {
    const { id: entryId } = await tx.journal.update({
      where: { userId_id: { userId: await getCurrentUserId(), id } },
      data: { content, preview: createPreview(content) },
    });

    return await prisma.analysis.update({
      where: { entryId },
      data: !content.trim()
        ? {
            emoji: "",
            mood: "",
            subject: "",
            summery: "",
            sentiment: 0,
          }
        : await getAiAnalysis(content),
      select: {
        emoji: true,
        mood: true,
        subject: true,
        summery: true,
        sentiment: true,
      },
    });
  });
}

export async function getEntry(id: string) {
  return await prisma.journal.findUniqueOrThrow({
    where: { userId_id: { userId: await getCurrentUserId(), id } },
    select: {
      content: true,
      date: true,
      analysis: {
        select: {
          emoji: true,
          mood: true,
          sentiment: true,
          subject: true,
          summery: true,
        },
      },
    },
  });
}

export async function mutateEntryDate(id: string, date: Date) {
  await prisma.journal.update({
    where: { userId_id: { userId: await getCurrentUserId(), id } },
    data: { date: new Date(date) },
  });
}

export async function getEntries() {
  return await prisma.journal.findMany({
    where: { userId: await getCurrentUserId() },
    orderBy: { date: "desc" },
    select: { id: true, date: true, preview: true },
  });
}

export async function getMostRecentEntryDate() {
  const entry = await prisma.journal.findFirst({
    where: { userId: await getCurrentUserId() },
    orderBy: { date: "desc" },
    select: { date: true },
  });

  return entry?.date;
}

export async function getChartAnalyses(start: Date, end: Date) {
  return await prisma.analysis.findMany({
    where: {
      userId: await getCurrentUserId(),
      AND: [{ date: { gte: start } }, { date: { lte: end } }],
    },
    orderBy: { date: "asc" },
    select: { sentiment: true, date: true, mood: true, emoji: true },
  });
}

function normalizeTime(date: Date) {
  return new Date(setMinutes(setHours(date, 5), 30));
}

function createPreview(content: string) {
  return content.substring(0, PREVIEW_LENGTH);
}
