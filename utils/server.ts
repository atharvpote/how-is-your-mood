import { NextResponse } from "next/server";
import { Analysis } from "@prisma/client";
import { prisma } from "./db";
import { analyze } from "./ai";
import { getUserByClerkId } from "./auth";

export async function getEntry(id: string) {
  const user = await getUserByClerkId();

  const entry = await prisma.journal.findUniqueOrThrow({
    where: { userId_id: { userId: user.id, id } },
    include: { analysis: true },
  });

  if (!entry.analysis) throw new Error("NotFoundError: No Analysis found.");

  return { entry, analysis: entry.analysis };
}

export async function getMostRecentEntry() {
  const user = await getUserByClerkId();

  return await prisma.journal.findFirst({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });
}

interface ClerkUser {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  clerkId: string;
  email: string;
}

export async function createEntry({ id: userId }: ClerkUser) {
  const { id: entryId, date } = await prisma.journal.create({
    data: {
      userId,
      content: "",
    },
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

    let analysis: Analysis;

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
