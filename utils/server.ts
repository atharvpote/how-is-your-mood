import { NextResponse } from "next/server";
import { Analysis } from "@prisma/client";
import { prisma } from "./db";
import { analyze } from "./ai";
import { getUserIdByClerkId } from "./auth";

export async function getEntry(id: string) {
  const userId = await getUserIdByClerkId();

  const entry = await prisma.journal.findUniqueOrThrow({
    where: { userId_id: { userId, id } },
    select: {
      content: true,
      id: true,
      date: true,
      analysis: {
        select: {
          emoji: true,
          mood: true,
          sentiment: true,
          subject: true,
          summery: true,
          date: true,
        },
      },
    },
  });

  if (!entry.analysis) throw new Error("NotFoundError: No Analysis found.");

  return { entry, analysis: entry.analysis };
}

export async function getMostRecentEntry(userId: string) {
  return await prisma.journal.findFirst({
    where: { userId },
    orderBy: { date: "desc" },
    select: { date: true },
  });
}

export async function createEntry(userId: string) {
  const { id: entryId, date } = await prisma.journal.create({
    data: {
      userId,
      content: "",
    },
    select: { id: true, date: true },
  });

  const { entryId: analysisEntryId } = await prisma.analysis.create({
    data: {
      emoji: "",
      mood: "",
      subject: "",
      summery: "",
      entryId,
      date,
      userId,
    },
    select: { entryId: true },
  });

  return analysisEntryId;
}

export type EntryAnalysis = Pick<
  Analysis,
  "sentiment" | "mood" | "emoji" | "subject" | "summery"
>;

const selectAnalysis = {
  emoji: true,
  mood: true,
  subject: true,
  summery: true,
  sentiment: true,
};

export async function updateContent(
  userId: string,
  entryId: string,
  content: string,
) {
  try {
    const { id: journalEntryId } = await prisma.journal.update({
      where: { userId_id: { userId, id: entryId } },
      data: { content },
      select: { id: true },
    });

    let analysis: Pick<
      Analysis,
      "emoji" | "mood" | "subject" | "summery" | "sentiment"
    >;

    if (content.trim().length === 0)
      analysis = await prisma.analysis.update({
        where: { entryId: journalEntryId },
        data: {
          emoji: "",
          mood: "",
          subject: "",
          summery: "",
          sentiment: 0,
        },
        select: selectAnalysis,
      });
    else {
      const { mood, emoji, sentiment, subject, summery } =
        await analyze(content);

      analysis = await prisma.analysis.update({
        where: { entryId: journalEntryId },
        data: {
          emoji,
          mood,
          subject,
          summery,
          sentiment,
        },
        select: selectAnalysis,
      });
    }

    return NextResponse.json({ analysis }, { status: 200 });
  } catch (error) {
    return errorResponse(error, 500);
  }
}

export async function updateDate(userId: string, entryId: string, date: Date) {
  try {
    await prisma.journal.update({
      where: { userId_id: { userId, id: entryId } },
      data: { date },
      select: {},
    });

    return NextResponse.json({ status: 200 });
  } catch (error) {
    return errorResponse(error, 500);
  }
}

export function errorResponse(error: unknown, status: number) {
  return NextResponse.json(
    error instanceof Error
      ? { message: error.message }
      : {
          message: "Unknown error",
          error,
        },
    { status },
  );
}
